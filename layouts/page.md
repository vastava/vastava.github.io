{{- /* Markdown output: emits front matter + the original markdown body. */ -}}
---
title: {{ .Title }}
{{ with .Description }}description: {{ . }}
{{ end -}}
date: {{ .Date.Format "2006-01-02" }}
{{ if not .Lastmod.IsZero }}lastmod: {{ .Lastmod.Format "2006-01-02" }}
{{ end -}}
source: {{ with .OutputFormats.Get "html" }}{{ .Permalink }}{{ end }}
---

{{ with .Params.authors_note }}
{{ . }}

{{ end -}}
{{ .RawContent }}
