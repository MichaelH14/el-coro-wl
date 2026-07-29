---
name: tailwind-patterns
description: Use when styling with Tailwind CSS, configuring responsive design, implementing dark mode, or extracting component classes
---

## Preconditions
- Tailwind CSS 3.4+ or 4.x
- PostCSS configured, content paths set

## Utility-First Principle
```html
<!-- Do this: compose utilities -->
<button class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
  Save
</button>
<!-- Don't: create .btn-primary with @apply for everything -->
```

## Custom Config
```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: { brand: { 50: '#f0f9ff', 500: '#3b82f6', 900: '#1e3a5f' } },
      spacing: { 18: '4.5rem' },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
};
```

## Responsive Design (Mobile-First)
```html
<!-- Mobile default, md: tablet, lg: desktop -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
```
- Breakpoints: `sm:640` `md:768` `lg:1024` `xl:1280` `2xl:1536`

## Dark Mode
```html
<!-- class strategy (manual toggle) -->
<div class="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
```
- Config: `darkMode: 'class'` for manual, `'media'` for OS preference

## Component Extraction
- First: extract React/Vue component (keeps utilities inline)
- Second: if pure HTML repetition, use `@apply` sparingly
```css
/* Only for truly repeated base elements */
@layer components {
  .btn { @apply rounded-lg px-4 py-2 font-medium transition-colors; }
}
```

## Common Patterns
- Truncate: `truncate` (single line) or `line-clamp-3`
- Center: `flex items-center justify-center`
- Container: `mx-auto max-w-7xl px-4`
- Visually hidden: `sr-only`

## Verification
- No unused custom CSS — utilities cover it
- Responsive tested at all breakpoints
- Dark mode toggled and visually verified
- `@apply` used in fewer than 5 places total
