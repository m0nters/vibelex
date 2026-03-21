import "@testing-library/jest-dom";
import { vi } from "vitest";

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
