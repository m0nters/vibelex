---
trigger: always_on
glob:
description: Testing rules for the Vibelex project
---

# Testing Rules

## Stack

- **Runner**: Vitest — configured in `vite.config.ts`
- **DOM environment**: `jsdom`
- **Component testing**: `@testing-library/react`
- **Assertions**: `@testing-library/jest-dom` (loaded in `src/test/setup.ts`)
- **Chrome API mock**: A global `chrome` object is stubbed in `src/test/setup.ts` using `vi.stubGlobal`. Do **not** install or use `vitest-chrome` — it is a CommonJS library incompatible with Vitest 4.

---

## General Rules

### Don't import Vitest globals — they are auto-injected
`describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll` are **globally available** via `globals: true` in `vite.config.ts`.

✅ Correct:
```ts
describe("myFunc", () => {
  it("does something", () => {
    expect(myFunc()).toBe(true);
  });
});
```

❌ Wrong — unnecessary import:
```ts
import { describe, it, expect } from "vitest"; // ← remove this
```

The ONLY exception is when you need `vi` for advanced mock control inside a module that doesn't use any other global (`vi.fn()`, `vi.mocked()`, etc.) — but even then, rely on the global `vi` directly.

### Create a test file for every new piece of logic
Whenever you create a new:
- **Utility function** → add `src/utils/myUtil.test.ts`
- **Service function** → add `src/services/*/myService.test.ts`
- **Custom hook** → add `src/hooks/useMyHook.test.ts`
- **UI component** → add `src/components/*/MyComponent.test.tsx` (Phase 4)

Test files live alongside the source file they test.

### All imports must be at the top of the file
`import` declarations are statically hoisted in ESM. Never place them mid-file after test code — it is structurally wrong and confusing even if it happens to work at runtime.

---

## Mocking Rules

### Chrome API mocking
The global `chrome` object is pre-mocked in `src/test/setup.ts` using `vi.stubGlobal`. Every test file gets it automatically.

- Use `vi.clearAllMocks()` in `beforeEach` to reset call history between tests.
- Because Chrome API functions (e.g. `chrome.storage.local.get`) have multiple overloads, TS cannot infer which one `vi.mocked()` targets. Always cast to `any` inside `vi.mocked()`:

```ts
// ✅ Correct
vi.mocked(chrome.storage.local.get as any).mockResolvedValueOnce({});

// ❌ Wrong — TS error on overloaded function
vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({});
```

- The `chrome.storage.sync.get` mock must handle **both** the callback style (used in `useEffect`) and the Promise style (used in async functions). Use `mockImplementation` with an arity check:

```ts
vi.mocked(chrome.storage.sync.get as any).mockImplementation(
  (_keys, callback?) => {
    if (!callback) return Promise.resolve(data);
    callback(data);
  },
);
```

### Module mocking with `vi.mock`
Use `vi.mock` with `importOriginal` to avoid accidentally mocking the entire module:

```ts
vi.mock("./historyStorage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./historyStorage")>();
  return {
    ...actual,           // keep all real exports
    getHistory: vi.fn(), // only override what you need
  };
});
```

### Fake timers — always clean up in `afterEach`
Never call `vi.useRealTimers()` only at the end of a test body. If an assertion throws, the cleanup never runs and timers will bleed into subsequent tests.

```ts
// ✅ Correct
afterEach(() => {
  vi.useRealTimers();
});

it("uses a fixed timestamp", () => {
  vi.useFakeTimers();
  vi.setSystemTime(9999);
  // ... assertions
});

// ❌ Wrong — leaks if assertion fails
it("bad pattern", () => {
  vi.useFakeTimers();
  vi.setSystemTime(9999);
  expect(...).toBe(...); // if this throws, useRealTimers never runs
  vi.useRealTimers();
});
```

---

## Assertion Rules

### Use `toBeCloseTo` for floating-point values
Never use exact equality for calculated percentages, ratios, or `Date`-based values:

```ts
// ✅ Robust
expect(result.percentage).toBeCloseTo(66.67, 1);

// ❌ Fragile — relies on identical IEEE-754 bit pattern
expect(result.percentage).toBe((2 / 3) * 100);
```

### Use specific queries, not weak length guards
A test weakened to `toBeGreaterThan(0)` is almost no test at all. If a fuzzy search or filter returns unexpected extra results, fix the test data or query to be more specific rather than loosening the assertion.

```ts
// ✅ Use a specific enough term so the result is exactly 1
const result = await searchHistory("con mèo"); // full phrase
expect(result).toHaveLength(1);

// ❌ Weak — doesn't verify uniqueness
const result = await searchHistory("mèo");
expect(result.length).toBeGreaterThan(0);
```

### Avoid mutating shared test fixtures
Always spread or clone arrays before passing them to functions that might sort in place:

```ts
const shared = [entryA, entryB];

// ✅ Safe copy
vi.mocked(getHistory).mockResolvedValue([...shared]);
```

---

## Test Tiers

| Tier | Scope | Location | Mocks needed |
|------|-------|----------|--------------|
| 1 — Pure unit | Utility functions with no I/O | `src/utils/*.test.ts` | None |
| 2 — Service | Functions calling Chrome APIs | `src/services/**/*.test.ts` | `chrome.*` via global + `vi.mock` for storage modules |
| 3 — Hooks | Custom React hooks | `src/hooks/*.test.ts` | Services + Chrome API |
| 4 — Components | UI rendering & interaction | `src/components/**/*.test.tsx` | Services + hooks via `vi.mock` |

Start at the lowest tier that exercises the logic you want to verify.
