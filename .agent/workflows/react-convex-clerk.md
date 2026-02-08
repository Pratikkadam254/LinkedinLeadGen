---
description: React + Convex + Clerk development guidelines for this project
---

# React + Convex + Clerk Development Guidelines

When working on this project, follow these conventions:

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Convex (real-time database)
- **Auth**: Clerk
- **UI**: Shadcn/ui + Tailwind CSS

## Convex Patterns
// turbo
1. Always define validators for `args` AND `returns` in queries/mutations
2. Use `v.id("tableName")` for document references
3. Use `ConvexError` for user-facing errors
4. Organize functions by domain (users.ts, tasks.ts, etc.)
5. Use indexes for efficient queries, not `.filter()`

## Clerk Patterns
1. Use `clerkMiddleware()` in middleware
2. Use `useUser()` hook for client-side user data
3. Protect routes with `SignedIn`/`SignedOut` components

## Code Style
// turbo
1. Use TypeScript for all code
2. Prefer interfaces over types
3. Use functional components, not classes
4. Use named exports for components
5. Handle errors at the beginning of functions (guard clauses)

## File Organization
```
src/
├── components/       # React components
│   ├── ui/           # Shadcn UI components
│   └── features/     # Feature-specific components  
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
convex/
├── schema.ts         # Database schema
├── [domain].ts       # Domain-organized functions
```

## Quick Commands
// turbo
- Run dev server: `npm run dev`
- Deploy Convex: `npx convex deploy`
- Generate types: `npx convex dev`
