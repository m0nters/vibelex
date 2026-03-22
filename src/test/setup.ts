import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom does not implement scrollIntoView — stub it globally so components
// that call element.scrollIntoView() don't throw a TypeError in tests.
Element.prototype.scrollIntoView = vi.fn();

// ─── react-i18next global mock ─────────────────────────────────────────────
// Returns the translation key as-is so component tests don't need a real i18n
// backend. Tests assert on keys like "common:on" rather than actual copy.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

// ─── Chrome API global mock ────────────────────────────────────────────────

const createStorageMock = () => ({
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
});

// Setup global Chrome API mock
vi.stubGlobal("chrome", {
  storage: {
    local: createStorageMock(),
    sync: createStorageMock(),
    session: createStorageMock(),
    managed: createStorageMock(),
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
});
