---
name: email-campaigns
description: Use when the user wants to create, review, or improve email campaigns for onboarding, retention, or win-back flows
---

# Email Campaigns

Design and generate email sequences for onboarding, retention, and win-back across all products.

## Preconditions

- Product identified ([Product Name], [Product Name], WhatsApp Bot)
- User lifecycle stages defined (new, active, at-risk, churned)
- Email sending infrastructure available or planned

## Steps

### 1. Onboarding Flow

Sequence triggered on signup:

| Email | Timing | Purpose |
|-------|--------|---------|
| Welcome | Immediate | Value prop, first action CTA |
| Day 1 | +24h | Feature highlight, quick win |
| Day 3 | +72h | Social proof, deeper feature |
| Day 7 | +168h | Full value unlocked, upgrade CTA |

Each email: subject line (< 50 chars), preview text, single CTA, unsubscribe link.

### 2. Retention Flow

For active users, maintain engagement:

- **Weekly digest**: personalized activity summary + what's new
- **Milestone**: congratulate on usage milestones (10th game, 50th lottery check)
- **Feature announcement**: new features relevant to their usage pattern

Trigger: user active in last 7 days.

### 3. Win-Back Flow

Re-engage inactive users:

| Email | Timing | Approach |
|-------|--------|----------|
| Soft nudge | Inactive 7 days | "We miss you" + what they're missing |
| Value reminder | Inactive 14 days | Show results/wins they could have had |
| Last chance | Inactive 30 days | Special offer or new feature teaser |

After 30-day email: move to cold list, stop emailing.

### 4. Template Per Product

- **[Product Name]**: results they missed, upcoming big draws, winning stats
- **[Product Name]**: games played, rating progress, tournament invites
- **WhatsApp Bot**: conversations handled, time saved, new capabilities

### 5. Content Rules

- Spanish first (DR market primary)
- Short paragraphs (2-3 sentences max)
- One CTA per email (no decision fatigue)
- Mobile-first layout (80%+ open on mobile)
- Plain text fallback for every HTML email

## Verification / Exit Criteria

- All 3 flows (onboarding, retention, win-back) have complete sequences
- Each email has subject, preview text, body, and CTA defined
- No email sent to users inactive > 30 days (respect inbox)
- Templates exist for each active product
- Unsubscribe link present in every template
