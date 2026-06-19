# UI Coding Standards

## Component Library

This project uses **shadcn/ui** as the sole source of UI components. All UI elements must come from the shadcn/ui library.

### Rules

1. **Only use shadcn/ui components.** Every UI element (buttons, cards, dialogs, inputs, dropdowns, etc.) must be a shadcn/ui component installed via the CLI (`npx shadcn@latest add <component>`).

2. **No custom components.** Do not create custom UI components. If a UI pattern is needed, find the appropriate shadcn/ui component and install it. If shadcn/ui does not offer a component for a given need, compose existing shadcn/ui components together rather than building from scratch.

3. **No third-party UI libraries.** Do not install or use other component libraries (e.g., Material UI, Chakra UI, Ant Design, Radix primitives directly). shadcn/ui already wraps Radix — use the shadcn/ui version.

4. **Component location.** All shadcn/ui components live in `src/components/ui/`. Do not move them or create parallel component directories.

5. **Styling.** Use Tailwind CSS utility classes for layout and spacing. shadcn/ui components accept a `className` prop for customization — use that instead of wrapper elements or custom CSS.

6. **Variants and props.** Use the built-in variant system (via `cva`) that shadcn/ui components provide. Extend variants in the component file if needed rather than overriding styles externally.

7. **Adding new components.** Install components with the CLI:
   ```bash
   npx shadcn@latest add <component-name>
   ```
   Do not copy-paste component code from the shadcn/ui docs manually.

### Currently Installed Components

- Button (`@/components/ui/button`)
- Calendar (`@/components/ui/calendar`)
- Card (`@/components/ui/card`)
- Input (`@/components/ui/input`)
- Label (`@/components/ui/label`)
- Popover (`@/components/ui/popover`)
