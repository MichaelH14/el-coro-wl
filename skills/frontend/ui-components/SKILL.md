---
name: ui-components
description: Use when creating reusable UI components, implementing compound component patterns, working with design tokens, or ensuring accessibility compliance
---

## Preconditions
- React + TypeScript
- Tailwind or CSS-in-JS for styling
- Target: WCAG 2.1 AA compliance

## Design System Tokens
```ts
export const tokens = {
  color: { primary: 'var(--color-primary)', error: 'var(--color-error)' },
  radius: { sm: '4px', md: '8px', lg: '16px' },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
} as const;
```

## Base Components
```tsx
// Button with variants
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}
function Button({ variant = 'primary', size = 'md', loading, children, ...props }: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size])} disabled={loading} {...props}>
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

## Compound Components
```tsx
// Composable API: <Select><Select.Option>...</Select.Option></Select>
const SelectContext = createContext<SelectState>(null!);
function Select({ children, value, onChange }: SelectProps) {
  return <SelectContext.Provider value={{ value, onChange }}>{children}</SelectContext.Provider>;
}
Select.Option = function Option({ value, children }: OptionProps) {
  const ctx = useContext(SelectContext);
  return <li role="option" aria-selected={ctx.value === value} onClick={() => ctx.onChange(value)}>{children}</li>;
};
```

## Accessibility Essentials
- Every interactive element: keyboard accessible (Enter, Space, Escape, Arrow keys)
- Modals: trap focus, restore focus on close, `role="dialog"` + `aria-modal`
- Images: `alt` text always. Decorative: `alt=""`
- Form inputs: associated `<label>` or `aria-label`
- Live regions: `aria-live="polite"` for dynamic content updates

## Focus Management
```tsx
const dialogRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  dialogRef.current?.focus();
  return () => triggerRef.current?.focus(); // restore on close
}, []);
```

## Verification
- Tab through all interactive elements — logical order
- Screen reader test (VoiceOver / NVDA) on key flows
- Color contrast ratio meets 4.5:1 (text) / 3:1 (large text)
- All components work with keyboard only
