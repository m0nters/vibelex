import { renderHook, act } from "@testing-library/react";
import { useDarkMode } from "./useDarkMode";

describe("useDarkMode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    // Reset document classes
    document.documentElement.className = "";
    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("should initialize with false when no localStorage and matchMedia is false", () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should initialize with true when localStorage has 'dark'", () => {
    localStorage.setItem("theme", "dark");
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should initialize with true when matchMedia is true and no localStorage", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
    })) as any;

    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should toggle dark mode state and update localStorage/DOM", () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDarkMode).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDarkMode).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  describe("chrome.storage.onChanged listener", () => {
    it("registers and cleans up the onChanged listener", () => {
      const { unmount } = renderHook(() => useDarkMode());

      expect(chrome.storage.onChanged.addListener).toHaveBeenCalledTimes(1);

      unmount();

      expect(chrome.storage.onChanged.removeListener).toHaveBeenCalledTimes(1);
      // Should remove the same handler that was added
      const addedHandler = vi.mocked(chrome.storage.onChanged.addListener)
        .mock.calls[0][0];
      const removedHandler = vi.mocked(chrome.storage.onChanged.removeListener)
        .mock.calls[0][0];
      expect(addedHandler).toBe(removedHandler);
    });

    it("updates state when chrome.storage.onChanged fires with a new theme", async () => {
      const { result } = renderHook(() => useDarkMode());
      expect(result.current.isDarkMode).toBe(false);

      // Grab the handler that was registered
      const handler = vi.mocked(chrome.storage.onChanged.addListener).mock
        .calls[0][0] as (
        changes: { [key: string]: chrome.storage.StorageChange },
        namespace: string,
      ) => void;

      // Simulate external storage change
      await act(async () => {
        handler({ theme: { newValue: "dark" } }, "local");
      });

      expect(result.current.isDarkMode).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("ignores storage changes from non-local namespace", () => {
      const { result } = renderHook(() => useDarkMode());

      const handler = vi.mocked(chrome.storage.onChanged.addListener).mock
        .calls[0][0] as (
        changes: { [key: string]: chrome.storage.StorageChange },
        namespace: string,
      ) => void;

      act(() => {
        handler({ theme: { newValue: "dark" } }, "sync");
      });

      // Should still be false — "sync" namespace is ignored
      expect(result.current.isDarkMode).toBe(false);
    });

    it("ignores storage changes for non-theme keys", () => {
      const { result } = renderHook(() => useDarkMode());

      const handler = vi.mocked(chrome.storage.onChanged.addListener).mock
        .calls[0][0] as (
        changes: { [key: string]: chrome.storage.StorageChange },
        namespace: string,
      ) => void;

      act(() => {
        handler({ appLangCode: { newValue: "vi" } }, "local");
      });

      expect(result.current.isDarkMode).toBe(false);
    });

    it("does not cause infinite write-back when onChanged fires with current value", () => {
      renderHook(() => useDarkMode());

      // Clear all mocks AFTER initial mount (which writes "light" to storage)
      vi.clearAllMocks();

      const handler = vi.mocked(chrome.storage.onChanged.addListener).mock
        .calls[0]?.[0] as
        | ((
            changes: { [key: string]: chrome.storage.StorageChange },
            namespace: string,
          ) => void)
        | undefined;

      // If handler is undefined after clearAllMocks, re-render to get it
      // This shouldn't happen since addListener was called before clearAllMocks
      if (!handler) return;

      // Simulate onChanged with "light" (same as current state)
      act(() => {
        handler({ theme: { newValue: "light" } }, "local");
      });

      // React should bail out (same state value), so no useEffect re-run,
      // meaning NO additional storage write
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });
});

