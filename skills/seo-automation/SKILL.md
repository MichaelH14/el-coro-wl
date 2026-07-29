---
name: seo-automation
description: Use when the user asks about SEO, search optimization, keyword strategy, meta descriptions, or content for improving search rankings
---

# SEO Automation

Automate SEO tasks across the user's products. Output actionable keyword lists, meta tags, content outlines, and linking maps.

## Preconditions

- Target product identified ([Product Name], [Product Name], or WhatsApp Bot)
- Access to current site pages/routes for internal linking
- Language context known (Spanish primary, English for international targeting)

## Steps

### 1. Keyword Research

For each product, generate seed keywords from:
- Product features and use cases
- Competitor domains (manual input)
- Long-tail queries users would search

Output format:
```json
{
  "keyword": "lottery results dominican republic",
  "volume_estimate": "high|medium|low",
  "difficulty_estimate": "high|medium|low",
  "intent": "informational|transactional|navigational",
  "target_page": "/results"
}
```

Group by intent. Prioritize transactional keywords for product pages, informational for blog content.

### 2. Meta Descriptions

Generate meta title + description for every page:
- Title: 50-60 characters, keyword-first, brand at end
- Description: 150-160 characters, include CTA, match search intent
- One primary keyword per page (no cannibalization)

### 3. Blog Outlines

For informational keywords, generate structured outlines:
- H1 matches target keyword naturally
- 3-5 H2 sections covering subtopics
- Each H2 has 2-3 bullet points of content direction
- Internal links to product pages where relevant

### 4. Internal Linking Strategy

Map every page to 2-4 internal link targets:
- Product pages link to related features
- Blog posts link to product pages (conversion path)
- No orphan pages (every page reachable within 3 clicks)
- Anchor text uses target keyword of destination page

### 5. Per-Product Focus

- **[Product Name]**: "resultados loteria", sorteo schedules, winning numbers
- **[Product Name]**: "chess betting", tournament play, multi-currency
- **WhatsApp Bot**: "WhatsApp bot", AI assistant, automation

## Verification / Exit Criteria

- Every product page has unique meta title + description
- No keyword cannibalization (one primary keyword per page)
- Blog outlines include at least 2 internal links each
- Internal link map has no orphan pages
- Spanish content generated for DR/LATAM market by default
