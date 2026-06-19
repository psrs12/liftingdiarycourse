# Authentication Coding Standards

## Provider

This project uses **Clerk** as the sole authentication provider. All auth logic must use Clerk's official packages and components.

### Rules

1. **Only use Clerk for authentication.** Do not implement custom auth flows, JWT handling, or session management. Clerk handles all of this.

2. **No other auth libraries.** Do not install or use NextAuth.js, Auth.js, Lucia, Supabase Auth, or any other auth solution.

3. **Use the Next.js SDK.** Use `@clerk/nextjs` as the primary package. This provides middleware, server helpers, and React components purpose-built for the App Router.

4. **Middleware.** Protect routes using Clerk's `clerkMiddleware()` in `src/middleware.ts`. Define public routes explicitly — all other routes are protected by default.

5. **Server-side auth.** Use `auth()` from `@clerk/nextjs/server` in Server Components, Route Handlers, and Server Actions to access the current user's session and ID.

6. **Client-side auth.** Use Clerk's React hooks (`useUser`, `useAuth`, `useClerk`) from `@clerk/nextjs` in Client Components. Do not store auth state in React state or context — Clerk manages this.

7. **Pre-built UI components.** Use Clerk's pre-built components (`<SignIn />`, `<SignUp />`, `<UserButton />`, `<UserProfile />`) rather than building custom auth UI. These respect the app's theme and handle all edge cases.

8. **Environment variables.** Clerk keys must be set in `.env.local` (never committed):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```

9. **Route conventions.** Auth pages live at:
   - `/sign-in/[[...sign-in]]/page.tsx`
   - `/sign-up/[[...sign-up]]/page.tsx`

   Set these in `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```

10. **ClerkProvider.** Wrap the app with `<ClerkProvider>` in the root layout (`src/app/layout.tsx`). Do not nest multiple providers.

11. **Protecting API routes.** In Route Handlers, call `auth()` and check for a valid `userId` before processing the request. Return `401` if unauthenticated.

12. **User data.** Access user metadata through Clerk's APIs and hooks. Do not duplicate Clerk user data into your own database unless syncing via Clerk webhooks for a specific purpose (e.g., storing a foreign key reference).

13. **Role-based access.** If needed, use Clerk's Organizations or session claims for roles and permissions — do not build a custom RBAC system.
