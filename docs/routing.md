# Routing Coding Standards

## Route Structure

All application routes live under `/dashboard`. The root `/` page is the public landing page. Everything else is accessed through the `/dashboard` prefix.

### Rules

1. **All app routes nest under `/dashboard`.** Every page a logged-in user interacts with must be a child of `src/app/dashboard/`. Do not create top-level routes for authenticated features.

2. **`/dashboard` and all sub-routes are protected.** Only authenticated users can access these pages. Unauthenticated users must be redirected to the sign-in page.

3. **Route protection via Next.js middleware.** Use Clerk's `clerkMiddleware()` in `src/middleware.ts` to protect routes. Define public routes explicitly (e.g., `/`, `/sign-in`, `/sign-up`) — all other routes are protected by default. Do not implement route protection in layouts, pages, or components.

4. **Middleware location.** The middleware file must be at `src/middleware.ts`. This is the single source of truth for route access control.

5. **Middleware configuration.** Use `createRouteMatcher` from `@clerk/nextjs/server` to define public routes, then protect everything else:
   ```ts
   import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

   const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

   export default clerkMiddleware(async (auth, request) => {
     if (!isPublicRoute(request)) {
       await auth.protect();
     }
   });

   export const config = {
     matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
   };
   ```

6. **No client-side route guards.** Do not check authentication status in components to conditionally render pages or redirect. The middleware handles this before the page ever loads.

7. **Dynamic segments.** Use Next.js dynamic route segments for resource-specific pages (e.g., `/dashboard/workout/[workoutId]`). Keep the URL hierarchy flat and readable.

8. **Route organization.** Group related features into subdirectories under `dashboard/`:
   ```
   src/app/dashboard/
   ├── page.tsx                        # /dashboard (main view)
   ├── workout/
   │   └── [workoutId]/
   │       └── page.tsx                # /dashboard/workout/:id
   ```

9. **No route groups for auth.** Do not use Next.js route groups `(protected)` or `(public)` to separate authenticated vs. unauthenticated routes. The middleware is the single mechanism for route protection.

10. **Redirects after auth.** Configure Clerk's post-sign-in and post-sign-up redirect URLs to `/dashboard` in `.env.local`:
    ```
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
    ```
