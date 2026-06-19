# Data Mutation Coding Standards

## Core Principle

All data mutations (creates, updates, deletes) **must** be performed via **Next.js Server Actions** defined in colocated `actions.ts` files. These Server Actions call helper functions in `src/data/` which wrap database calls using **Drizzle ORM**. No other mechanism (Route Handlers, inline server functions, direct `db` imports) may be used for mutations.

## Rules

1. **All mutations use Server Actions.** Every create, update, and delete operation must be triggered by a Server Action. Server Actions are the only entry point for mutations from the client.

2. **Server Actions live in colocated `actions.ts` files.** Each route directory that performs mutations must contain an `actions.ts` file alongside its `page.tsx`. Mark the file with `"use server"` at the top. Do not define Server Actions inline in components or in a shared global file.

3. **Server Actions handle auth and validation only.** The Server Action authenticates the user (via `auth()` from Clerk), validates inputs, then delegates the actual database work to a helper function in `src/data/`. Server Actions must not contain Drizzle queries directly.

4. **All database logic lives in `src/data/`.** Every insert, update, and delete query must be implemented as an exported function in a file under `src/data/`. Organize files by domain entity (e.g., `src/data/workouts.ts`, `src/data/exercises.ts`, `src/data/sets.ts`, `src/data/users.ts`).

5. **Use Drizzle ORM exclusively.** All database operations must use the Drizzle query builder and the `db` instance exported from `src/db/index.ts`. Do not write raw SQL strings, use other ORMs (Prisma, Knex, etc.), or call the database driver directly.

6. **No direct `db` imports outside `src/data/`.** Server Actions, Server Components, and any other code must call the helper functions from `src/data/` — never import `db` from `src/db/index.ts` directly. The `src/data/` layer is the only consumer of `db`.

7. **Queries also belong in `src/data/`.** Read operations (selects, joins, aggregations) follow the same pattern. Keep all Drizzle calls — reads and writes — co-located in `src/data/` so the data access layer is a single source of truth.

8. **Use the schema from `src/db/schema.ts`.** All table references and column references must use the schema objects exported from `src/db/schema.ts`. Do not duplicate table or column names as strings.

9. **Function naming.** Name helpers with a clear verb-noun pattern that describes the operation:
   - `createWorkout`, `updateWorkout`, `deleteWorkout`
   - `addExerciseToWorkout`, `updateSet`, `getWorkoutsByUser`

10. **Type safety.** Define input types using `typeof table.$inferInsert` and return types using `typeof table.$inferSelect` from Drizzle. Export these types when consumers need them. Do not use `any`.

11. **Server Action parameters must be explicitly typed.** All Server Action function parameters must use typed objects or primitives — never use `FormData` as a parameter type. Parse form data on the client side and pass typed arguments to the Server Action.

12. **Server Actions must validate arguments with Zod.** Every Server Action must validate its input using a Zod schema before processing. Define the schema in the same `actions.ts` file and parse arguments at the top of the function. Reject invalid input early with a clear error.

13. **Auth context.** Helper functions that operate on user-scoped data must accept a `userId` parameter (the Clerk user's internal database ID) and scope all queries to that user. Never trust the caller to have already filtered — always enforce ownership in the query.

14. **Transactions.** When a mutation involves multiple related writes (e.g., creating a workout with exercises and sets), use Drizzle's `db.transaction()` inside the helper to ensure atomicity. Do not spread related writes across multiple helper calls without a transaction.

15. **No mutation logic in components.** React components (Server or Client) must never contain Drizzle queries or direct database calls. All data access flows through `src/data/` helpers, invoked only from Server Actions.

16. **No Route Handlers for mutations.** Do not use Route Handlers (`route.ts`) for data mutations. Server Actions in colocated `actions.ts` files are the only permitted pattern.

## Directory Structure

```
src/
├── app/
│   ├── workouts/
│   │   ├── page.tsx       # UI
│   │   └── actions.ts     # "use server" — Server Actions for workout mutations
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── actions.ts     # "use server" — Server Actions for dashboard mutations
├── data/                  # Data access layer (all Drizzle queries)
│   ├── users.ts           # createUser, getUserByClerkId, ...
│   ├── workouts.ts        # createWorkout, getWorkoutsByUser, ...
│   ├── exercises.ts       # addExerciseToWorkout, ...
│   └── sets.ts            # addSet, updateSet, ...
├── db/                    # Database config (do not import directly outside src/data/)
│   ├── index.ts           # Drizzle db instance
│   └── schema.ts          # Table definitions and relations
```
