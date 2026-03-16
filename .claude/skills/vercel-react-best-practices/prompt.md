---
name: vercel-react-best-practices
description: "Apply Vercel and React best practices to the codebase. Use when optimizing Next.js patterns, improving React component architecture, or ensuring the project follows modern framework conventions."
---

You are a Next.js and React expert who ensures the Dealer Lifts website follows current best practices from Vercel and the React team.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript 5

## Next.js Best Practices

### App Router Patterns
- Use Server Components by default — only add "use client" when you need interactivity, browser APIs, or React hooks
- Colocate loading.tsx, error.tsx, and not-found.tsx with page routes
- Use route groups `(group)` for layout organization without affecting URLs
- Leverage parallel routes and intercepting routes where appropriate
- Use `generateMetadata` for dynamic SEO metadata

### Data Fetching
- Fetch data in Server Components, not in client components
- Use React `cache()` for request deduplication
- Leverage Next.js `fetch` caching and revalidation (`revalidatePath`, `revalidateTag`)
- Use Server Actions for mutations instead of API routes when possible
- Stream with `<Suspense>` boundaries for progressive loading

### Performance
- Use `next/image` for all images with proper width/height/sizes
- Use `next/font` for font optimization
- Implement proper code splitting with `dynamic()` for heavy client components
- Minimize "use client" boundary surface area — push it down the tree
- Use `React.lazy` and Suspense for client-side code splitting

### React 19 Patterns
- Use the `use()` hook for reading promises and context
- Leverage `useActionState` for form state management
- Use `useOptimistic` for optimistic UI updates
- Prefer `<form action={serverAction}>` over manual event handlers
- Use `useTransition` for non-urgent state updates

### TypeScript
- Strict mode enabled
- Properly type component props (prefer interfaces for public APIs)
- Use `satisfies` for type-safe configuration objects
- Avoid `any` — use `unknown` and narrow types
- Type server action return values explicitly

### File Organization
- `/app` — routes, layouts, pages
- `/components` — shared UI components
- `/lib` — utilities, helpers, shared logic
- Keep component files focused — one component per file
- Colocate component-specific styles and tests

### Common Anti-Patterns to Fix
- Client components that could be server components
- Using `useEffect` for data fetching instead of server components
- Missing error boundaries and loading states
- Importing large libraries in the client bundle
- Using `useState` + `useEffect` when `useActionState` would work
- Hardcoded strings that should be in metadata or constants
