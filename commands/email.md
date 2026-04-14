---
name: email
description: Create or review email campaign for a product
arguments: "<type> <product> — type: onboarding, retention, win-back | product: target product name"
---

# /email

You have been invoked to create or review an email campaign.

## Workflow

1. **Campaign Type** — Identify the email sequence type:
   - **onboarding**: Welcome new users, guide to first value moment.
   - **retention**: Re-engage existing users, highlight features, build habit.
   - **win-back**: Recover churned users, special offers, "we miss you."

2. **Audience Definition**:
   - Who receives this email? (new users, inactive 7d, churned 30d, etc.)
   - Segment size estimate if data available.
   - Exclusions: who should NOT receive this.

3. **Email Sequence Design** — Create the sequence:
   - **Onboarding** (typically 5 emails over 14 days):
     1. Welcome + quick start guide.
     2. Key feature highlight (day 2).
     3. Social proof / case study (day 5).
     4. Advanced feature / tip (day 8).
     5. Feedback request + help offer (day 14).
   - **Retention** (typically 3 emails per month):
     1. Product update / new feature.
     2. Usage tip / best practice.
     3. Community highlight / milestone.
   - **Win-back** (typically 3 emails over 21 days):
     1. "We miss you" + what's new (day 1).
     2. Special offer or incentive (day 7).
     3. Final appeal + feedback request (day 21).

4. **Email Content** — For each email provide:
   - Subject line (A/B variants: 2 options).
   - Preview text.
   - Body copy (concise, scannable, one CTA per email).
   - CTA button text and destination URL.

5. **Review Checklist**:
   - Subject lines under 50 characters.
   - No spam trigger words.
   - Mobile-friendly layout.
   - Unsubscribe link present.
   - Personalization used (name, product usage data).
   - Links are correct and trackable.

## Rules
- One CTA per email — do not overwhelm the reader.
- Subject lines should create curiosity, not clickbait.
- Every email must provide value, not just ask for something.
- Test emails before sending (formatting, links, personalization).
