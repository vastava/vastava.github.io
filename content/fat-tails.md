---
title: Why fat tailed costs emerge at scale
description: Unrelated contexts and spiky concurrent traffic create a moving capacity boundary
date: 2026-01-17
keywords: AI, pricing, Cursor, Anthropic, tokens, economics, cost structure
aliases:
  - /fat_tails
params:
  doc_link: https://docs.google.com/document/d/10WOc_dcFTHWD7Pcs8ZquxGWsilxpwFUJfny-0rXigNo/edit?usp=sharing
---

<div class="authors-note">

**Author's note:** This essay builds on the systems analysis presented in [A token is not a fixed unit of cost](/token-pricing). Together, they explain the quantitative relationship between fixed prices and variable compute costs under fat-tailed demand. I focus on Claude Code, Cursor and OpenCode in this series because their public pricing changes make these tradeoffs the most visible in the industry. But the dynamic applies to any provider running inference at scale.

</div>
