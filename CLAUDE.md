# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (Next.js)
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npx tsc --noEmit` — type-check without emitting

## Stack

- Next.js 16 with App Router (`src/app/`)
- React 19, TypeScript 5
- Tailwind CSS 4 (via `@tailwindcss/postcss` plugin in `postcss.config.mjs`)

## Architecture

- `src/app/` — App Router pages and layouts (file-based routing)
- `src/app/layout.tsx` — root layout (fonts, global styles, metadata)
- `src/app/globals.css` — global styles and Tailwind theme config (`@theme inline`)
- `src/app/page.tsx` — home page

## Path Alias

- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Use `@/` for all imports from `src/` — e.g. `import { Foo } from "@/components/Foo"`

## Styling

- Use Tailwind CSS utility classes; avoid custom CSS unless necessary
- Theme tokens defined in `globals.css` via `@theme inline` — use `--color-background`, `--color-foreground`, `--font-sans`, `--font-mono`
- Dark mode via `prefers-color-scheme: dark` (CSS-level, no JS toggle)
- Apply `antialiased` on `<html>`, layout classes on `<body>`

## Fonts

- Geist (sans) and Geist Mono loaded via `next/font/google` in `layout.tsx`
- Exposed as CSS variables `--font-geist-sans` and `--font-geist-mono`
- Mapped to Tailwind's `--font-sans` and `--font-mono` in `globals.css`
- Use `font-sans` / `font-mono` Tailwind classes (not raw CSS vars)

## TypeScript

- Strict mode enabled
- Prefer `interface` over `type` for object shapes
- Use `Readonly<>` for component props (already in root layout)
- No `any` — use `unknown` and narrow, or define proper types
- Place shared types in `src/types/` when used across multiple files
