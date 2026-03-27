#!/usr/bin/env python3
"""Download cover art for the bookshelf cards in index.html.

The script parses the bookshelf section from the site's homepage so the HTML
remains the source of truth for titles/authors. It then downloads cover images
for the book entries into ``images/bookshelf/``.

Default source order:
1. Manual overrides for items that do not exist in Open Library.
2. Open Library search + Covers API for books with canonical editions.

Entries without a good cover strategy are skipped explicitly and recorded in the
manifest.
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import re
import sys
from dataclasses import dataclass
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen


USER_AGENT = "bookshelf-cover-downloader/1.0"
OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"
OPEN_LIBRARY_COVER_BY_ID_URL = "https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"
OPEN_LIBRARY_COVER_BY_OLID_URL = "https://covers.openlibrary.org/b/olid/{olid}-L.jpg"

# Items in the shelf that are not books with canonical cover art.
SKIP_ITEMS = {
    "Reaction Wheel blog": "rendered directly in index.html from the site masthead",
    "argmin blog": "substack; leave the cover blank for now",
}

# Explicit source for shelf items that are not available via Open Library.
MANUAL_ITEMS = {
    "American Vandal": {
        "cover_url": "https://static.tvmaze.com/uploads/images/original_untouched/168/420408.jpg",
        "note": "poster via TVMaze",
    },
    "Causal Inference for the Brave and True": {
        "cover_url": "https://matheusfacure.github.io/python-causality-handbook/_images/brave-and-true.png",
        "note": "official cover from the author's site",
    },
}

@dataclass
class BookshelfItem:
    title: str
    author: str


class BookshelfParser(HTMLParser):
    """Extract titles and authors from the bookshelf section."""

    def __init__(self) -> None:
        super().__init__()
        self.items: list[BookshelfItem] = []
        self._section_depth = 0
        self._in_bookshelf = False
        self._in_article = False
        self._current_title: list[str] = []
        self._current_author: list[str] = []
        self._capture_title = False
        self._capture_author = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = dict(attrs)
        classes = set((attr_map.get("class") or "").split())

        if tag == "section" and "bookshelf" in classes:
            self._in_bookshelf = True
            self._section_depth = 1
            return

        if self._in_bookshelf and tag == "section":
            self._section_depth += 1

        if not self._in_bookshelf:
            return

        if tag == "article" and "book-card" in classes:
            self._in_article = True
            self._current_title = []
            self._current_author = []
            return

        if not self._in_article:
            return

        if tag == "h2" and "title" in classes:
            self._capture_title = True
            return

        if tag == "p" and "author" in classes:
            self._capture_author = True
            return

    def handle_endtag(self, tag: str) -> None:
        if self._in_bookshelf and tag == "section":
            self._section_depth -= 1
            if self._section_depth == 0:
                self._in_bookshelf = False
            return

        if not self._in_bookshelf:
            return

        if tag == "h2":
            self._capture_title = False
            return

        if tag == "p":
            self._capture_author = False
            return

        if tag == "article" and self._in_article:
            title = _clean_text("".join(self._current_title))
            author = _clean_author("".join(self._current_author))
            if title and author:
                self.items.append(BookshelfItem(title=title, author=author))
            self._in_article = False
            return

    def handle_data(self, data: str) -> None:
        if self._capture_title:
            self._current_title.append(data)
        elif self._capture_author:
            self._current_author.append(data)


def _clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value)).strip()


def _clean_author(value: str) -> str:
    cleaned = _clean_text(value)
    if cleaned.lower().startswith("by "):
        return cleaned[3:].strip()
    return cleaned


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "cover"


def _normalized(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def _title_candidates(title: str) -> list[str]:
    candidates = [title]
    if ":" in title:
        candidates.append(title.split(":", 1)[0].strip())
    # Some cards use long display titles while the catalog entry uses a simpler
    # canonical form. Retrying with the short title keeps the HTML as the source
    # of truth without hardcoding every subtitle.
    return list(dict.fromkeys(candidate for candidate in candidates if candidate))


def _fetch_json(url: str, params: dict[str, Any]) -> dict[str, Any]:
    full_url = f"{url}?{urlencode(params)}"
    request = Request(full_url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def _download_bytes(url: str) -> tuple[bytes, str]:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=30) as response:
        content_type = response.headers.get_content_type()
        return response.read(), content_type


def _title_score(doc: dict[str, Any], title: str, author: str) -> int:
    wanted_title = _normalized(title)
    wanted_author = _normalized(author)
    doc_title = _normalized(doc.get("title", ""))
    doc_authors = _normalized(" ".join(doc.get("author_name", [])))

    score = 0
    if doc_title == wanted_title:
        score += 100
    elif wanted_title in doc_title or doc_title in wanted_title:
        score += 50

    wanted_words = set(wanted_title.split())
    doc_words = set(doc_title.split())
    score += len(wanted_words & doc_words)

    if wanted_author:
        wanted_author_words = set(wanted_author.split())
        score += 5 * len(wanted_author_words & set(doc_authors.split()))
        if wanted_author.split()[-1:] and wanted_author.split()[-1] in doc_authors:
            score += 20

    if doc.get("cover_i"):
        score += 5
    if doc.get("edition_key"):
        score += 3

    return score


def _resolve_open_library_cover(item: BookshelfItem) -> tuple[str, dict[str, Any]] | None:
    docs: list[dict[str, Any]] = []
    for query_title in _title_candidates(item.title):
        payload = _fetch_json(
            OPEN_LIBRARY_SEARCH_URL,
            {"title": query_title, "author": item.author, "limit": 10},
        )
        docs = payload.get("docs", [])
        if docs:
            break

    if not docs:
        return None

    best = max(docs, key=lambda doc: _title_score(doc, item.title, item.author))

    if best.get("cover_i"):
        return OPEN_LIBRARY_COVER_BY_ID_URL.format(cover_id=best["cover_i"]), best

    edition_keys = best.get("edition_key") or []
    if edition_keys:
        return OPEN_LIBRARY_COVER_BY_OLID_URL.format(olid=edition_keys[0]), best

    return None


def _extension_for_url(url: str, content_type: str) -> str:
    path_suffix = Path(urlparse(url).path).suffix.lower()
    if path_suffix in {".jpg", ".jpeg", ".png", ".webp"}:
        return path_suffix
    guessed = mimetypes.guess_extension(content_type) or ".jpg"
    return ".jpg" if guessed == ".jpe" else guessed


def parse_bookshelf_items(index_path: Path) -> list[BookshelfItem]:
    parser = BookshelfParser()
    parser.feed(index_path.read_text(encoding="utf-8"))
    return parser.items


def download_covers(
    index_path: Path,
    output_dir: Path,
    force: bool,
    dry_run: bool,
) -> list[dict[str, Any]]:
    items = parse_bookshelf_items(index_path)
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest: list[dict[str, Any]] = []

    for item in items:
        title = item.title
        filename_base = _slugify(title)

        if title in SKIP_ITEMS:
            manifest.append(
                {
                    "title": title,
                    "author": item.author,
                    "status": "skipped",
                    "reason": SKIP_ITEMS[title],
                }
            )
            continue

        source_url: str | None = None
        source_note = ""

        manual = MANUAL_ITEMS.get(title)
        if manual:
            source_url = manual["cover_url"]
            source_note = manual.get("note", "")
        else:
            resolved = _resolve_open_library_cover(item)
            if resolved is None:
                manifest.append(
                    {
                        "title": title,
                        "author": item.author,
                        "status": "error",
                        "reason": "no cover source found",
                    }
                )
                continue
            source_url, metadata = resolved
            source_note = f"Open Library: {metadata.get('title', '').strip()}"

        if dry_run:
            manifest.append(
                {
                    "title": title,
                    "author": item.author,
                    "status": "planned",
                    "source_url": source_url,
                    "note": source_note,
                }
            )
            continue

        try:
            content, content_type = _download_bytes(source_url)
        except (HTTPError, URLError) as exc:
            manifest.append(
                {
                    "title": title,
                    "author": item.author,
                    "status": "error",
                    "reason": f"download failed: {exc}",
                    "source_url": source_url,
                }
            )
            continue

        if len(content) < 1024:
            manifest.append(
                {
                    "title": title,
                    "author": item.author,
                    "status": "error",
                    "reason": "downloaded file is unexpectedly small",
                    "source_url": source_url,
                }
            )
            continue

        suffix = _extension_for_url(source_url, content_type)
        output_path = output_dir / f"{filename_base}{suffix}"

        if output_path.exists() and not force:
            manifest.append(
                {
                    "title": title,
                    "author": item.author,
                    "status": "exists",
                    "path": str(output_path),
                    "source_url": source_url,
                    "note": source_note,
                }
            )
            continue

        output_path.write_bytes(content)
        manifest.append(
            {
                "title": title,
                "author": item.author,
                "status": "downloaded",
                "path": str(output_path),
                "source_url": source_url,
                "note": source_note,
            }
        )

    return manifest


def build_parser() -> argparse.ArgumentParser:
    repo_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--index",
        type=Path,
        default=repo_root / "index.html",
        help="path to the site's index.html",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=repo_root / "images" / "bookshelf",
        help="directory to write cover images into",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="overwrite existing cover files",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="resolve sources without downloading files",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    manifest = download_covers(
        index_path=args.index,
        output_dir=args.output_dir,
        force=args.force,
        dry_run=args.dry_run,
    )

    manifest_path = args.output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    counts: dict[str, int] = {}
    for item in manifest:
        counts[item["status"]] = counts.get(item["status"], 0) + 1
        status = item["status"].upper()
        details = item.get("path") or item.get("reason") or item.get("source_url", "")
        print(f"[{status}] {item['title']} - {details}")

    print("\nSummary:")
    for status in sorted(counts):
        print(f"  {status}: {counts[status]}")
    print(f"  manifest: {manifest_path}")

    errors = counts.get("error", 0)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
