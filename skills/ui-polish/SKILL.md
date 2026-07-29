---
name: ui-polish
description: Use before shipping any UI, to review all states, responsive breakpoints, spacing, animations, and accessibility compliance
---

# UI Polish

Pre-release UI quality checklist. Every interface reviewed against this before shipping.

## Preconditions

- Feature functionally complete (logic works)
- Design system tokens applied
- Component renders without errors

## Steps

### 1. All States Covered

For every interactive element, verify:

| State | Check |
|-------|-------|
| Default | Renders correctly with typical data |
| Empty | Shows helpful empty state (not blank page) |
| Loading | Shows skeleton or spinner (not frozen UI) |
| Error | Shows error message with retry action |
| Disabled | Visually distinct, not clickable |
| Hover | Visual feedback on desktop |
| Focus | Visible focus ring (keyboard navigation) |
| Active/pressed | Feedback on click/tap |
| Overflow | Long text truncates or wraps gracefully |

Missing states = incomplete feature. Do not ship without empty and error states.

### 2. Responsive Design (3 Breakpoints)

Test at these widths:
- **Mobile**: 375px (iPhone SE / small Android)
- **Tablet**: 768px (iPad portrait)
- **Desktop**: 1280px (standard laptop)

Check:
- Layout does not break at any width between 320px and 1920px
- Touch targets >= 44px on mobile
- Text readable without zooming on mobile
- No horizontal scroll (unless intentional, like a table)
- Navigation works on all breakpoints (hamburger menu on mobile)

### 3. Spacing System

- All spacing uses design system tokens (4/8/12/16/24/32px)
- No magic numbers (no `margin: 13px`)
- Consistent internal padding within cards and sections
- Consistent gap between sibling elements
- Page margins: 16px on mobile, 24px on tablet, 32px+ on desktop

### 4. Animations

- Transitions: 150ms for micro-interactions (hover, focus), 300ms for layout changes
- Easing: `ease-out` for entrances, `ease-in` for exits
- Respect `prefers-reduced-motion`: disable animations for users who opt out

```css
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0ms !important; animation-duration: 0ms !important; }
}
```

- No animation that blocks interaction (user can always click during animation)
- Loading spinners appear after 200ms delay (avoid flash on fast loads)

### 5. Accessibility

Minimum checks:
- [ ] Color contrast ratio >= 4.5:1 for text, >= 3:1 for large text
- [ ] All images have alt text (decorative images: `alt=""`)
- [ ] Form inputs have associated labels (not just placeholder)
- [ ] Focus order follows visual order (tab through page logically)
- [ ] Error messages linked to inputs with `aria-describedby`
- [ ] Interactive elements reachable and operable with keyboard
- [ ] Screen reader can navigate page structure (proper heading hierarchy)

### 6. Final Visual Scan

Open in browser, step back, and check:
- Alignment: are things lined up that should be?
- Hierarchy: is the most important thing visually prominent?
- Consistency: does this page look like it belongs with the rest of the app?
- Whitespace: enough breathing room? Not cramped?

## Verification / Exit Criteria

- All interactive states implemented (empty, loading, error minimum)
- Layout works at 375px, 768px, and 1280px without breaking
- Spacing uses only design system tokens
- Animations respect prefers-reduced-motion
- Accessibility checklist all items pass
- No visual regressions in existing pages
