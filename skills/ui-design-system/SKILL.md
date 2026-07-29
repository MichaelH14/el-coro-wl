---
name: ui-design-system
description: Use when defining or updating design tokens, creating base component styles, or ensuring visual consistency across products
---

# UI Design System

Design tokens and component patterns. Consistent visual language across all products.

## Preconditions

- Frontend framework identified (React/Next.js default)
- Styling approach chosen (Tailwind CSS default)
- Product brand colors defined (or need defining)

## Steps

### 1. Design Tokens

Define tokens as the single source of truth:

**Colors**:
```css
--color-primary: #2563EB;       /* brand action color */
--color-primary-hover: #1D4ED8;
--color-secondary: #64748B;
--color-success: #16A34A;
--color-warning: #D97706;
--color-error: #DC2626;
--color-bg: #FFFFFF;
--color-bg-muted: #F8FAFC;
--color-text: #0F172A;
--color-text-muted: #64748B;
```

**Spacing** (8px base):
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px
```

**Typography**:
```
text-xs: 12px / 16px
text-sm: 14px / 20px
text-base: 16px / 24px
text-lg: 18px / 28px
text-xl: 20px / 28px
text-2xl: 24px / 32px
text-3xl: 30px / 36px
```

**Shadows**:
```
shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
shadow: 0 1px 3px rgba(0,0,0,0.1)
shadow-md: 0 4px 6px rgba(0,0,0,0.1)
shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
```

### 2. Base Components

Minimum component set every project needs:
- **Button**: primary, secondary, outline, ghost, destructive + sizes (sm, md, lg)
- **Input**: text, password, number, select, textarea + error state
- **Card**: container with optional header, body, footer
- **Badge**: status indicator (success, warning, error, info)
- **Modal**: overlay, content, close button, focus trap
- **Toast**: success, error, info notifications

### 3. Per-Product Themes

Override tokens per product:
- **[Product Name]**: energetic colors (orange/yellow accents), number-focused typography
- **[Product Name]**: classic tones (dark green/wood), chess piece iconography
- **WhatsApp Bot**: WhatsApp-adjacent green, chat bubble patterns

Same components, different token values.

### 4. Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        // ... map all tokens
      },
      spacing: {
        // extend if needed beyond Tailwind defaults
      },
    },
  },
};
```

### 5. Component Documentation

Each component needs:
- Props interface (TypeScript)
- Visual states: default, hover, focus, disabled, error
- Usage example
- Do/don't guidelines

## Verification / Exit Criteria

- All tokens defined (colors, spacing, typography, shadows)
- Base component set implemented with all states
- Per-product theme overrides tested
- Tailwind config uses token variables (not hardcoded values)
- Components accessible (keyboard nav, screen reader labels)
