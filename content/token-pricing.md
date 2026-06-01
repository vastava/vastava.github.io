---
title: A token is not a fixed unit of cost
description: Variance in usage creates an interconnected pricing and scaling issue
date: 2025-08-23
modifed: 2025-11-16
keywords: AI, pricing, Cursor, Anthropic, tokens, economics, cost structure
aliases:
  - /token_pricing
params:
  note: |
    **Author's note:** This essay and [Why Fat Tails Emerge at Scale](/fat-tails) offer a systems analysis of inference economics. Together, they explain the quantitative relationship between fixed prices and variable compute costs under fat-tailed demand. I focus on Claude Code, Cursor and OpenCode in this series because their public pricing changes make these tradeoffs the most visible in the industry. But the dynamic applies to any provider running inference at scale.
  footer: |
    Thank you to [@hypersoren](https://x.com/hypersoren), [@trickylabyrinth](https://x.com/trickylabyrinth) and [Judah](https://joodaloop.com/) for their work, and to Jason Harrison, Anthony Crognale, Suraj Srivats, Ade Oshineye and Alex Komoroske for feedback on early versions of this.
  doc_link: https://docs.google.com/document/d/1pAtbkNXb-Myxdi7wgxMGBID9VRjhA7yKY26ubI_TyIQ/edit?usp=sharing
  sidebar_note: | 
    This essay was widely shared and I went on two podcasts to discuss it:
    - 🔗  [Live with Tim O'Reilly](https://www.youtube.com/watch?v=6AXMO2dW0LI)
    - 🔗  [--dangerously-skip-permissions](https://www.youtube.com/watch?v=SODf4_1CQqk)
---
