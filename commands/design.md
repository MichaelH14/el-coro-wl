---
name: design
description: Full design workflow — design system, mobile-first, all states
arguments: <component> — what to design (page, component, flow)
---

# /design

You have been invoked to create a complete UI design implementation.

## Workflow

Dispatch the `designer` agent.

1. **Design System Check** — Verify or establish design foundations.
   - Does the project have a design system? (colors, typography, spacing, components).
   - If yes: use existing tokens and patterns consistently.
   - If no: define minimal design tokens before building (colors, font sizes, spacing scale).
   - Document design decisions.

2. **Mobile-First Implementation** — Build from smallest screen up.
   - Start with mobile layout (320px-480px).
   - Add tablet breakpoints (768px).
   - Add desktop breakpoints (1024px+).
   - Ensure touch targets are at least 44x44px on mobile.
   - Test that content is readable without horizontal scrolling.

3. **State Coverage** — Implement ALL states for the component:
   - **Empty state**: No data yet. Helpful message + CTA.
   - **Loading state**: Skeleton or spinner. Never blank screen.
   - **Error state**: Clear error message + recovery action.
   - **Success state**: Normal data display.
   - **Edge cases**: Long text, missing images, single item, many items.
   - **Interactive states**: Hover, focus, active, disabled.

4. **Polish** — Finishing touches:
   - Spacing is consistent (using design tokens, not magic numbers).
   - Animations are subtle and purposeful (not decorative).
   - Color contrast meets WCAG AA (4.5:1 for text).
   - Focus indicators visible for keyboard navigation.

5. **QA Gate Review** — qa-gate validates the design implementation:
   - All states implemented.
   - Responsive at all breakpoints.
   - Accessible (keyboard nav, screen reader labels).
   - Consistent with design system.

## Rules
- ALWAYS mobile-first. Never desktop-down.
- EVERY component needs empty, loading, and error states. No exceptions.
- No magic numbers for spacing — use the design system scale.
- Accessibility is a requirement, not a nice-to-have.
