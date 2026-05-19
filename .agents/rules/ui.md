---
trigger: always_on
glob:
description: UI and dark mode styling rules for the Vibelex project
---

## UI & Dark Mode Rules

### Dark Mode Styling Conventions
When implementing dark mode for new components or screens, follow these established conventions:
- **Tailwind v4**: We use the `@custom-variant dark (&:where(.dark, .dark *));` approach. Always use the `dark:` prefix for dark mode styles.
- **Backgrounds**: Use `dark:bg-slate-800`, `dark:bg-slate-900`, or `dark:bg-slate-700` for main surfaces. For subtle tints, use opacity modifiers like `dark:bg-indigo-500/20`.
- **Borders**: Use `dark:border-slate-700` or `dark:border-slate-600`.
- **Text**: Use `dark:text-slate-300` for primary text to avoid eye strain, `dark:text-slate-400` for secondary, and `dark:text-slate-500` for tertiary/muted text. Avoid overly bright white colors like `text-white` or `text-slate-200` for body text in dark mode.
- **Warning Text**: Use softer, less saturated colors for dark background like `dark:text-red-400`.
- **Gradients**: Use softer, less saturated colors for gradients in dark mode to ensure readability (e.g., `dark:from-indigo-400 dark:to-purple-400`).
- **Contrast**: Always ensure high contrast for text over dark backgrounds. Avoid excessively dark transparent layers over dark backgrounds (e.g., prefer `indigo-500/20` over `indigo-900/30`).

### Component Testing Reminder
As stated in the 'Create a test file for every new piece of logic' rule, EVERY new UI component and custom hook MUST have a corresponding `.test.tsx` or `.test.ts` file created alongside it. Do not skip writing tests for newly created UI components like buttons, toggles, or layout wrappers.
