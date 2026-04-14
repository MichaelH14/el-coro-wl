---
name: polish
description: UI polish pass — states, responsive, spacing, accessibility
arguments: "[scope] — specific component or page (optional, defaults to recently changed UI)"
---

# /polish

You have been invoked to polish existing UI code.

## Workflow

Dispatch the `designer` agent in polish mode.

1. **Missing States Audit**
   - Check every component for: empty, loading, error, success states.
   - Flag any component that shows a blank screen or raw error.
   - Verify loading states use skeletons or spinners consistently.
   - Ensure error states have retry/recovery actions.

2. **Responsive Audit**
   - Test at breakpoints: 320px, 480px, 768px, 1024px, 1440px.
   - Flag: horizontal overflow, overlapping elements, unreadable text.
   - Verify navigation is usable on mobile (hamburger, bottom nav, etc.).
   - Check images are responsive (not fixed-width breaking layouts).

3. **Spacing and Layout**
   - Verify consistent spacing using design system tokens.
   - Flag magic numbers (e.g., `margin: 13px` instead of using spacing scale).
   - Check alignment: elements that should align visually do.
   - Verify whitespace hierarchy matches content hierarchy.

4. **Animations and Transitions**
   - Verify transitions are smooth (no janky or jumpy animations).
   - Check: page transitions, hover effects, modal open/close.
   - Ensure reduced-motion media query is respected.
   - Remove any purely decorative animations that don't aid UX.

5. **Accessibility**
   - Color contrast meets WCAG AA (4.5:1 text, 3:1 UI elements).
   - All interactive elements are keyboard accessible.
   - Focus order makes logical sense.
   - Images have alt text, icons have aria-labels.
   - Form inputs have associated labels.

6. **Report** — Polish summary:
   - Issues found: categorized by type.
   - Issues fixed: what was changed.
   - Remaining: anything that needs the user's decision (design choice).

## Rules
- Polish is cosmetic + UX only — do NOT change functionality.
- Run tests after every change to ensure nothing broke.
- If unsure about a design choice, flag it for the user rather than guessing.
- Accessibility fixes are always HIGH priority.
