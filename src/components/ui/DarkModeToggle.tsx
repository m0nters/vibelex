import { useDarkMode } from "@/hooks";
import { useTranslation } from "react-i18next";

interface DarkModeToggleProps {
  className?: string;
}

export function DarkModeToggle({ className = "" }: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { t } = useTranslation();
  return (
    <div
      className={className}
      title={isDarkMode ? t("lightMode") : t("darkMode")}
    >
      <div className="relative block h-6 w-12">
        {/* There're many small parts in the original "picture" in the switch,
            so I choose to draw them in original size (h-15 w-30), and scale
            them down later to match the final size (h-6 w-12) */}
        <div className="absolute top-0 left-0 h-15 w-30 origin-top-left scale-[0.4]">
          <input
            type="checkbox"
            id="DarkModeSwitch"
            aria-label={isDarkMode ? t("lightMode") : t("darkMode")}
            className="peer sr-only"
            checked={!isDarkMode}
            onChange={toggleDarkMode}
          />

          <label
            htmlFor="DarkModeSwitch"
            className={`relative inline-block h-15 w-30 cursor-pointer rounded-full border-[5px] transition-colors duration-300 ease-[cubic-bezier(.46,.03,.52,.96)] peer-focus-visible:ring-[5px] peer-focus-visible:ring-offset-[5px] peer-focus-visible:outline-none dark:peer-focus-visible:ring-offset-slate-900 ${
              !isDarkMode
                ? "border-[#347CF8] bg-[#8FB5F5] peer-focus-visible:ring-[#347CF8]"
                : "border-[#5B5B5B] bg-[#2B2B2B] peer-focus-visible:ring-[#5B5B5B]"
            }`}
          >
            {/* Indicator (Sun / Moon) */}
            <span
              className={`absolute top-1/2 left-1/2 block h-10 w-10 rounded-full transition-all duration-300 ease-[cubic-bezier(.46,.03,.52,.96)] ${
                !isDarkMode
                  ? "bg-[#ECD21F] shadow-none"
                  : "bg-[#7B7B7B] shadow-[10px_0px_0_0_rgba(0,0,0,0.2)_inset]"
              }`}
              style={{
                transform: !isDarkMode
                  ? "translate(-50%, -50%) translateX(72%)"
                  : "translate(-50%, -50%) translateX(-72%)",
              }}
            >
              {/* Craters (only in dark mode) */}
              <span
                className={`absolute top-1.75 left-1.75 block h-2.25 w-2.25 rounded-full bg-white opacity-60 transition-all duration-400 ease-[cubic-bezier(.46,.03,.52,.96)] ${
                  !isDarkMode ? "hidden" : ""
                }`}
              ></span>
              <span
                className={`absolute right-1.5 bottom-2 block h-3.5 w-3.5 rounded-full bg-white opacity-80 transition-all duration-400 ease-[cubic-bezier(.46,.03,.52,.96)] ${
                  !isDarkMode ? "hidden" : ""
                }`}
              ></span>
            </span>

            {/* Decoration (Clouds / Stars) */}
            <span
              className={`absolute block bg-white transition-all duration-400 ease-[cubic-bezier(.46,.03,.52,.96)] ${
                !isDarkMode
                  ? "animate-cloud top-1/2 left-1/2 h-5 w-5 rounded-t-full rounded-b-none"
                  : "animate-twinkle-3 top-[65%] left-1/2 h-1.25 w-1.25 rounded-full"
              }`}
              style={!isDarkMode ? { transform: "translate(0%, -50%)" } : {}}
            >
              {/* Cloud part 1 / Star 1 */}
              <span
                className={`absolute block bg-white transition-all duration-400 ${
                  !isDarkMode
                    ? "top-auto bottom-0 -left-2 h-2.5 w-2.5 rounded-t-full rounded-b-none"
                    : "animate-twinkle-1 -top-5 bottom-auto left-2.5 h-1.25 w-1.25 rounded-full opacity-100"
                }`}
              ></span>

              {/* Cloud part 2 / Star 2 */}
              <span
                className={`absolute block bg-white transition-all duration-400 ${
                  !isDarkMode
                    ? "top-auto bottom-0 left-4 h-3.75 w-3.75 rounded-t-full rounded-br-full rounded-bl-none"
                    : "animate-twinkle-2 -top-1.75 bottom-auto left-7.5 h-1.25 w-1.25 rounded-full"
                }`}
              ></span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
