# Drafts — content staged, not published

Everything in here is real, finished work that's deliberately kept out of the
built site for now. Nothing needs to be rewritten — restoring is just moving
the file back to where it came from.

## About page

`drafts/about.astro` → move to `src/pages/about.astro`:

```
git mv drafts/about.astro src/pages/about.astro
```

Then add the nav link back in `src/layouts/BaseLayout.astro`:

```html
<a href="/">home</a><span class="sep">/</span><a href="/about">about</a><span class="sep">/</span><a href="/rss.xml">rss</a>
```

The file as staged has placeholder bio copy — replace the two `<p>` paragraphs
with the real thing before restoring it; the PCB wordmark image and page
structure don't need to change.

## Blog posts

`drafts/blog/*.md` → move into `src/content/blog/`:

```
git mv drafts/blog/*.md src/content/blog/
```

They'll show up on the homepage and in `/rss.xml` automatically — no other
wiring needed. These three are genuine sample posts (traceroute internals,
the TLS 1.3 handshake, router DNS forwarding), not placeholders — keep them,
edit them, or replace them with real posts once there's actual content ready.

New posts (draft or real) follow the schema in `src/content.config.ts`:

```yaml
---
title: "..."
description: "..."   # one-line, shown in the homepage row + RSS
date: 2026-01-01
tags: ["..."]
readTime: "N min read"
---
```

## Current state of the live site

`src/content/blog/` is empty (just a `.gitkeep`) and there's no `/about`
route — the homepage's traceroute list renders empty, and `/rss.xml` is a
valid feed with zero items. That's expected, not broken.
