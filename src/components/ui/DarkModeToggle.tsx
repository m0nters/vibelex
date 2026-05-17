import { useDarkMode } from "@/hooks";

interface DarkModeToggleProps {
  className?: string;
}

export function DarkModeToggle({ className = "" }: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={className}>
      <div className="relative block h-6 w-12">
        <div className="absolute top-0 left-0 h-[60px] w-[120px] origin-top-left scale-[0.4]">
          <input
            type="checkbox"
            id="DarkModeSwitch"
            aria-label="Toggle Dark Mode"
            className="peer sr-only"
            checked={!isDarkMode}
            onChange={toggleDarkMode}
          />

          <label
            htmlFor="DarkModeSwitch"
            className={`relative inline-block h-[60px] w-[120px] cursor-pointer rounded-full border-[5px] transition-colors duration-300 ease-[cubic-bezier(.46,.03,.52,.96)] peer-focus:ring-[5px] peer-focus:ring-offset-[5px] peer-focus:outline-none dark:peer-focus:ring-offset-slate-900 ${
              !isDarkMode
                ? "border-[#347CF8] bg-[#8FB5F5] peer-focus:ring-[#347CF8]"
                : "border-[#5B5B5B] bg-[#2B2B2B] peer-focus:ring-[#5B5B5B]"
            }`}
          >
            {/* Indicator (Sun / Moon) */}
            <span
              className={`absolute top-1/2 left-1/2 block h-10 w-10 rounded-full transition-all duration-400 ease-[cubic-bezier(.46,.03,.52,.96)] ${
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
                className={`absolute top-[7px] left-[7px] block h-[9px] w-[9px] rounded-full bg-white opacity-60 transition-all duration-400 ease-[cubic-bezier(.46,.03,.52,.96)] ${
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
                  : "animate-twinkle-3 top-[65%] left-1/2 h-[5px] w-[5px] rounded-full"
              }`}
              style={!isDarkMode ? { transform: "translate(0%, -50%)" } : {}}
            >
              {/* Cloud part 1 / Star 1 */}
              <span
                className={`absolute block bg-white transition-all duration-400 ${
                  !isDarkMode
                    ? "top-auto bottom-0 -left-2 h-2.5 w-2.5 rounded-t-full rounded-b-none"
                    : "animate-twinkle-1 -top-5 bottom-auto left-2.5 h-[5px] w-[5px] rounded-full opacity-100"
                }`}
              ></span>

              {/* Cloud part 2 / Star 2 */}
              <span
                className={`absolute block bg-white transition-all duration-400 ${
                  !isDarkMode
                    ? "top-auto bottom-0 left-4 h-[15px] w-[15px] rounded-t-full rounded-br-full rounded-bl-none"
                    : "animate-twinkle-2 top-[-7px] bottom-auto left-[30px] h-[5px] w-[5px] rounded-full"
                }`}
              ></span>
            </span>
          </label>
        </div>
      </div>

      <style>{`
        @keyframes twinkle-1 {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes twinkle-2 {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes twinkle-3 {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        
        .animate-twinkle-1 {
          animation: twinkle-1 0.6s infinite;
        }
        .animate-twinkle-2 {
          animation: twinkle-2 0.6s infinite -0.2s;
        }
        .animate-twinkle-3 {
          animation: twinkle-3 0.8s infinite -0.6s;
        }
        
        @keyframes cloud {
          0% { transform: translate(0%, -50%); }
          50% { transform: translate(-50%, -50%); }
          100% { transform: translate(0%, -50%); }
        }
        .animate-cloud {
          animation: cloud 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
