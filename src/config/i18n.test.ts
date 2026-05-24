import { changeLanguage } from "./i18n";

// Mock i18next — the module initializes i18n at import time, so we must
// intercept it before the real init runs.
vi.mock("i18next", () => {
  const instance = {
    language: "en",
    use: vi.fn().mockReturnThis(),
    init: vi.fn(),
    changeLanguage: vi.fn().mockImplementation(async (lng: string) => {
      instance.language = lng;
    }),
  };
  return { default: instance };
});

vi.mock("i18next-http-backend", () => ({ default: {} }));
vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

// We need access to the mocked i18n instance to inspect / reset it
const getI18nMock = async () => {
  const mod = await import("i18next");
  return mod.default;
};

describe("changeLanguage", () => {
  let i18nMock: Awaited<ReturnType<typeof getI18nMock>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    i18nMock = await getI18nMock();
    i18nMock.language = "en";

    // Ensure chrome.tabs.query returns an array so broadcast logic runs
    vi.mocked(chrome.tabs.query as any).mockResolvedValue([]);
  });

  it("is a no-op when the requested language is already set", async () => {
    i18nMock.language = "vi";

    await changeLanguage("vi");

    // i18n.changeLanguage should NOT be called
    expect(i18nMock.changeLanguage).not.toHaveBeenCalled();
    // Storage should NOT be written to
    expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    // No broadcast should happen
    expect(chrome.tabs.query).not.toHaveBeenCalled();
  });

  it("changes language, saves to storage, and broadcasts when language differs", async () => {
    i18nMock.language = "en";

    await changeLanguage("vi");

    expect(i18nMock.changeLanguage).toHaveBeenCalledWith("vi");
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      appLangCode: "vi",
    });
    expect(chrome.tabs.query).toHaveBeenCalledWith({});
  });

  it("sends LANGUAGE_CHANGED message to each tab with an id", async () => {
    i18nMock.language = "en";
    vi.mocked(chrome.tabs.query as any).mockResolvedValue([
      { id: 1 },
      { id: 2 },
      { id: undefined }, // edge case: tab without id
    ]);
    vi.mocked(chrome.tabs.sendMessage as any).mockResolvedValue(undefined);

    await changeLanguage("fr");

    expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(2);
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, {
      type: "LANGUAGE_CHANGED",
      language: "fr",
    });
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(2, {
      type: "LANGUAGE_CHANGED",
      language: "fr",
    });
  });

  it("does not enter an infinite loop when called repeatedly with the same language", async () => {
    i18nMock.language = "en";

    // First call: should proceed
    await changeLanguage("vi");
    expect(i18nMock.changeLanguage).toHaveBeenCalledTimes(1);

    // Simulate what happens in the loop: language is now "vi",
    // so calling changeLanguage("vi") again must be a no-op.
    // (In the real bug, the LANGUAGE_CHANGED broadcast would bounce
    // back and call changeLanguage with the same language.)
    await changeLanguage("vi");
    await changeLanguage("vi");
    await changeLanguage("vi");

    // Still only 1 call — the guard prevented all subsequent calls
    expect(i18nMock.changeLanguage).toHaveBeenCalledTimes(1);
    expect(chrome.storage.sync.set).toHaveBeenCalledTimes(1);
  });
});
