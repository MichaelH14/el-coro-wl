---
name: frontend-performance
description: Use when optimizing frontend performance, improving Core Web Vitals, implementing lazy loading, or reducing bundle size
---

## Preconditions
- React/Next.js application
- Lighthouse or WebPageTest access for measurement

## Bundle Splitting
```tsx
// Route-based splitting (automatic in Next.js)
// Manual splitting for heavy libs:
const Chart = lazy(() => import('./Chart'));
// Named exports:
const { HeavyComponent } = await import('./heavy-module');
```
- Analyze with `npx next build` or `npx webpack-bundle-analyzer`
- Target: initial JS < 200KB gzipped

## Lazy Loading
```tsx
import { lazy, Suspense } from 'react';
const Editor = lazy(() => import('./Editor'));
<Suspense fallback={<Skeleton />}>
  <Editor />
</Suspense>
```
- Lazy load below-the-fold content, modals, heavy components

## Image Optimization
```tsx
// Next.js Image component
<Image src="/hero.jpg" width={1200} height={600} alt="Hero"
  priority  // above-the-fold: preload
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```
- Use WebP/AVIF formats
- `priority` for LCP image, `loading="lazy"` for everything else
- Set explicit width/height to prevent layout shift

## Core Web Vitals
| Metric | Good | What |
|--------|------|------|
| LCP | < 2.5s | Largest Contentful Paint — main content visible |
| INP | < 200ms | Interaction to Next Paint — responsiveness |
| CLS | < 0.1 | Cumulative Layout Shift — visual stability |

## Fixes by Metric
- **LCP**: preload hero image, reduce server response time, inline critical CSS
- **INP**: break long tasks (`requestIdleCallback`), debounce inputs, use `startTransition`
- **CLS**: set dimensions on images/embeds, avoid injecting content above fold

## Caching Strategies
- Static assets: `Cache-Control: public, max-age=31536000, immutable` (hashed filenames)
- HTML: `Cache-Control: no-cache` (revalidate every time)
- API: stale-while-revalidate pattern via TanStack Query or SWR

## Verification
- Lighthouse score > 90 on Performance
- Bundle size: `npx next build` shows no route > 200KB JS
- No layout shift visible on slow 3G throttle
- LCP image has `priority` or `fetchpriority="high"`
