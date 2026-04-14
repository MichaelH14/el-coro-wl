---
name: nextjs-patterns
description: Use when building with Next.js App Router, choosing between server and client components, implementing data fetching, middleware, or rendering strategies
---

## Preconditions
- Next.js 14+ with App Router
- TypeScript, Tailwind CSS

## Server vs Client Components
- Default: Server Component (runs on server, no JS shipped to client)
- Add `'use client'` only when you need: useState, useEffect, event handlers, browser APIs
- Push `'use client'` boundary as low as possible in the tree

## Data Fetching (Server Actions)
```tsx
// app/actions.ts
'use server';
export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  await db.user.create({ data: { name } });
  revalidatePath('/users');
}
```
- Server actions replace API routes for mutations
- Use `revalidatePath` or `revalidateTag` after mutations

## Middleware
```ts
// middleware.ts (root level)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session');
  if (!token) return NextResponse.redirect(new URL('/login', request.url));
  return NextResponse.next();
}
export const config = { matcher: ['/dashboard/:path*'] };
```

## Rendering Strategies
| Strategy | When | How |
|----------|------|-----|
| SSG | Content rarely changes | Default for static pages |
| ISR | Content changes periodically | `revalidate: 60` in fetch |
| SSR | Per-request freshness | `dynamic = 'force-dynamic'` |

## Layouts and Templates
- `layout.tsx`: persists across navigations, wraps children, shared UI
- `template.tsx`: re-mounts on navigation (use for animations/per-page state)
- `loading.tsx`: Suspense fallback for the route segment
- `error.tsx`: Error boundary for the route segment

## API Routes
```ts
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' });
}
```

## Verification
- No `'use client'` on components that don't need interactivity
- Server actions validate input (zod) before database ops
- `next build` completes without errors
- Check bundle size: `next build` output shows per-route JS size
