(function () {
    const BUTTON_SELECTOR = "[data-copy-essay-markdown]";
    const CONTENT_SELECTOR = "[data-essay-content]";

    function normalizeText(value) {
        return (value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
    }

    function escapeMarkdownLabel(value) {
        return value.replace(/\\/g, "\\\\").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
    }

    function cleanupInlineMarkdown(value, preserveBreaks) {
        let output = value.replace(/\u00a0/g, " ");

        if (preserveBreaks) {
            output = output.replace(/[ \t]+/g, " ");
            output = output.replace(/ *\n */g, "\n");
            output = output.replace(/\n{3,}/g, "\n\n");
        } else {
            output = output.replace(/\s+/g, " ");
        }

        return output
            .replace(/\s+([,.;:!?])/g, "$1")
            .replace(/\(\s+/g, "(")
            .replace(/\s+\)/g, ")")
            .trim();
    }

    function toAbsoluteUrl(url, baseUrl) {
        if (!url) {
            return "";
        }

        try {
            return new URL(url, baseUrl).href;
        } catch (error) {
            return url;
        }
    }

    function deriveImageAlt(image) {
        const explicitAlt = normalizeText(
            image.dataset.markdownAlt || image.getAttribute("alt") || image.getAttribute("title") || ""
        );

        if (explicitAlt) {
            return explicitAlt;
        }

        const source = image.getAttribute("src") || "diagram";
        const fileName = source.split("/").pop().split(".")[0].replace(/[-_]+/g, " ");
        return normalizeText("Diagram: " + fileName);
    }

    function inlineNodeToMarkdown(node, baseUrl, options) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent.replace(/\s+/g, " ");
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return "";
        }

        const tagName = node.tagName.toUpperCase();

        if (tagName === "BR") {
            return options.preserveBreaks ? "\n" : " ";
        }

        if (tagName === "A") {
            const href = toAbsoluteUrl(node.getAttribute("href"), baseUrl);
            const label = inlineNodesToMarkdown(node.childNodes, baseUrl, options) || href;
            return href ? "[" + escapeMarkdownLabel(label) + "](" + href + ")" : label;
        }

        if (tagName === "STRONG" || tagName === "B") {
            const content = inlineNodesToMarkdown(node.childNodes, baseUrl, options);
            return content ? "**" + content + "**" : "";
        }

        if (tagName === "EM" || tagName === "I") {
            const content = inlineNodesToMarkdown(node.childNodes, baseUrl, options);
            return content ? "*" + content + "*" : "";
        }

        if (tagName === "CODE") {
            const content = normalizeText(node.textContent).replace(/`/g, "\\`");
            return content ? "`" + content + "`" : "";
        }

        if (tagName === "IMG") {
            const source = toAbsoluteUrl(node.getAttribute("src"), baseUrl);
            const alt = escapeMarkdownLabel(deriveImageAlt(node));
            return source ? "![" + alt + "](" + source + ")" : "";
        }

        return inlineNodesToMarkdown(node.childNodes, baseUrl, options);
    }

    function inlineNodesToMarkdown(nodes, baseUrl, options) {
        let output = "";

        Array.from(nodes).forEach(function (node) {
            output += inlineNodeToMarkdown(node, baseUrl, options);
        });

        return cleanupInlineMarkdown(output, options.preserveBreaks);
    }

    function listItemToMarkdown(item, baseUrl, depth, ordered, index) {
        const nestedLists = [];
        const inlineNodes = [];

        Array.from(item.childNodes).forEach(function (node) {
            if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === "UL" || node.tagName === "OL")) {
                nestedLists.push(node);
                return;
            }

            inlineNodes.push(node);
        });

        const prefix = "  ".repeat(depth) + (ordered ? (index + 1) + ". " : "- ");
        const content = inlineNodesToMarkdown(inlineNodes, baseUrl, { preserveBreaks: true });
        const line = prefix + content;
        const nested = nestedLists.map(function (list) {
            return listToMarkdown(list, baseUrl, depth + 1);
        }).filter(Boolean).join("\n");

        return [line.trimEnd(), nested].filter(Boolean).join("\n");
    }

    function listToMarkdown(listElement, baseUrl, depth) {
        const ordered = listElement.tagName === "OL";

        return Array.from(listElement.children)
            .filter(function (child) {
                return child.tagName === "LI";
            })
            .map(function (item, index) {
                return listItemToMarkdown(item, baseUrl, depth, ordered, index);
            })
            .filter(Boolean)
            .join("\n");
    }

    function formulaToMarkdown(element, baseUrl) {
        const content = inlineNodesToMarkdown(element.childNodes, baseUrl, { preserveBreaks: true });

        if (!content) {
            return "";
        }

        return content
            .split(/\n{2,}/)
            .map(function (chunk) {
                return chunk.trim();
            })
            .filter(Boolean)
            .join("\n\n");
    }

    function childrenToMarkdown(element, baseUrl) {
        return Array.from(element.children)
            .map(function (child) {
                return blockToMarkdown(child, baseUrl);
            })
            .filter(Boolean)
            .join("\n\n");
    }

    function blockquoteToMarkdown(content) {
        return content
            .split("\n")
            .map(function (line) {
                return "> " + line;
            })
            .join("\n");
    }

    function blockToMarkdown(element, baseUrl) {
        if (!element) {
            return "";
        }

        if (element.classList.contains("table-of-contents")) {
            return "";
        }

        if (element.hasAttribute("data-copy-essay-markdown")) {
            return "";
        }

        const tagName = element.tagName.toUpperCase();

        if (tagName === "H1") {
            const heading = inlineNodesToMarkdown(element.childNodes, baseUrl, { preserveBreaks: false });
            return heading ? "## " + heading : "";
        }

        if (tagName === "H2") {
            const heading = inlineNodesToMarkdown(element.childNodes, baseUrl, { preserveBreaks: false });
            return heading ? "### " + heading : "";
        }

        if (tagName === "H3") {
            const heading = inlineNodesToMarkdown(element.childNodes, baseUrl, { preserveBreaks: false });
            return heading ? "#### " + heading : "";
        }

        if (tagName === "H4") {
            const heading = inlineNodesToMarkdown(element.childNodes, baseUrl, { preserveBreaks: false });
            return heading ? "##### " + heading : "";
        }

        if (tagName === "P") {
            const content = inlineNodesToMarkdown(element.childNodes, baseUrl, { preserveBreaks: true });
            if (!content) {
                return "";
            }

            if (element.classList.contains("blockquote")) {
                return blockquoteToMarkdown(content);
            }

            return content;
        }

        if (tagName === "UL" || tagName === "OL") {
            return listToMarkdown(element, baseUrl, 0);
        }

        if (tagName === "HR") {
            return "---";
        }

        if (tagName === "DIV" && element.classList.contains("image-container")) {
            return Array.from(element.querySelectorAll("img"))
                .map(function (image) {
                    return inlineNodeToMarkdown(image, baseUrl, { preserveBreaks: false });
                })
                .filter(Boolean)
                .join("\n\n");
        }

        if (tagName === "DIV" && element.classList.contains("formula")) {
            return formulaToMarkdown(element, baseUrl);
        }

        if (tagName === "DIV") {
            return childrenToMarkdown(element, baseUrl);
        }

        const content = inlineNodesToMarkdown(element.childNodes, baseUrl, { preserveBreaks: true });
        return content || childrenToMarkdown(element, baseUrl);
    }

    function buildEssayMarkdown(button) {
        const article = document.querySelector(CONTENT_SELECTOR);

        if (!article) {
            throw new Error("Essay content not found.");
        }

        const title = normalizeText(document.querySelector(".title")?.textContent || document.title);
        const deck = normalizeText(document.querySelector(".deckhead")?.textContent || "");
        const essayUrl = button.dataset.essayUrl || window.location.href.split("#")[0];

        const sections = ["# " + title];

        if (deck) {
            sections.push("_" + deck + "_");
        }

        sections.push("Source: " + essayUrl);

        const body = Array.from(article.children)
            .map(function (child) {
                return blockToMarkdown(child, essayUrl);
            })
            .filter(Boolean)
            .join("\n\n");

        if (body) {
            sections.push(body);
        }

        return sections.join("\n\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
    }

    async function copyTextToClipboard(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function" && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const copied = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!copied) {
            throw new Error("Clipboard copy failed.");
        }
    }

    function registerButton(button) {
        if (button.dataset.copyEssayReady === "true") {
            return;
        }

        button.dataset.copyEssayReady = "true";
        button.dataset.defaultLabel = button.textContent.trim();

        button.addEventListener("click", async function () {
            const defaultLabel = button.dataset.defaultLabel || "Copy Essay as Markdown for LLMs";

            if (button.dataset.resetTimerId) {
                window.clearTimeout(Number(button.dataset.resetTimerId));
                delete button.dataset.resetTimerId;
            }

            button.disabled = true;
            button.textContent = "Copying...";

            try {
                const markdown = buildEssayMarkdown(button);
                await copyTextToClipboard(markdown);
                button.textContent = "Copied Markdown";
            } catch (error) {
                button.textContent = "Copy Failed";
            } finally {
                button.disabled = false;

                const timerId = window.setTimeout(function () {
                    button.textContent = defaultLabel;
                    delete button.dataset.resetTimerId;
                }, 3000);

                button.dataset.resetTimerId = String(timerId);
            }
        });
    }

    function init() {
        document.querySelectorAll(BUTTON_SELECTOR).forEach(registerButton);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
