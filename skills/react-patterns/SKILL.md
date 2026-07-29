---
name: react-patterns
description: Use when building React components, managing state, implementing hooks, composition patterns, or error boundaries
---

## Preconditions
- React 18+ with TypeScript
- Strict mode enabled

## Custom Hooks
```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```
- Prefix with `use`, extract reusable logic, return minimal API

## Composition Over Inheritance
```tsx
// Slot pattern — compose, don't extend
function Card({ header, children, footer }: CardProps) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
```

## State Management Decision Tree
- Local UI state -> `useState`
- Complex local state with actions -> `useReducer`
- Shared across tree (theme, auth) -> `Context + useReducer`
- Server state -> TanStack Query (React Query)
- Global complex state -> Zustand (lightweight) or Jotai (atomic)

## Memoization
```tsx
// useMemo: expensive computation
const sorted = useMemo(() => items.sort(compareFn), [items]);
// useCallback: stable function reference for child props
const handleClick = useCallback(() => doThing(id), [id]);
// React.memo: skip re-render if props unchanged
const Row = memo(({ data }: RowProps) => <div>{data.name}</div>);
```
- Only memo when you measure a perf problem. Premature memo = complexity.

## Error Boundaries
```tsx
class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { logError(error, info); }
  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}
// Usage: <ErrorBoundary fallback={<p>Something broke</p>}>...
```

## Verification
- No `useEffect` for derived state (compute in render instead)
- Custom hooks tested independently with `renderHook`
- Error boundaries wrap each major feature section
