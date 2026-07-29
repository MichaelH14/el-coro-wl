---
name: component-library
description: Use when building UI components to leverage established component libraries (shadcn/ui, Radix) instead of building from raw Tailwind
---

# Component Library Strategy

Don't build UI components from raw Tailwind. Use established libraries as foundation.

## Recommended Stack

### For React/Next.js projects:
1. **shadcn/ui** — Copy-paste components built on Radix + Tailwind
   - NOT a dependency — components are copied into your project
   - Fully customizable
   - Professional quality out of the box
   - Install: `npx shadcn@latest init` then `npx shadcn@latest add [component]`

2. **Radix Primitives** — Unstyled, accessible UI primitives
   - Use when shadcn/ui components need heavy customization
   - Handles: accessibility, keyboard nav, focus management

3. **Tailwind CSS** — For custom styling on TOP of the above
   - Use for layout, spacing, custom compositions
   - NOT for building buttons, inputs, modals from scratch

## Preconditions
- A React/Next.js project needs UI components

## Steps

1. Check if project already has a component library
2. If not, recommend shadcn/ui for new projects
3. When building a component:
   - FIRST check if shadcn/ui has it → use it
   - If not → check Radix primitives → build on top
   - ONLY raw Tailwind if truly custom (data viz, unique interactions)
4. All components get design tokens from the project's design system

## Verification
- Components use established library, not raw HTML/Tailwind
- Accessible by default (keyboard nav, screen reader, focus management)
- Consistent with project design system tokens
