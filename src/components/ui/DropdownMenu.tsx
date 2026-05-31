import Fuse from "fuse.js";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface DropdownOption {
  value: string;
  label: string;
  searchTerms?: string[]; // Extra strings to match against (e.g. transliterated labels)
}

interface DropdownMenuProps {
  value: string;
  options: DropdownOption[];
  pin?: DropdownOption; // Option to pin at the top
  onChange: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void; // for dynamic height adaption
  className?: string;
  focusColor?: string;
  canSearch?: boolean;
  isSorted?: boolean;
  size?: "default" | "compact"; // compact = smaller font size, use for dictionary popup language selector
  align?: "left" | "right"; // Which edge of the trigger the options panel anchors to
}

// Move color classes outside component to avoid recreation
const FOCUS_COLOR_CLASSES = {
  dropdown: {
    purple:
      "focus-visible:border-purple-500 focus-visible:ring-purple-100 dark:focus-visible:border-purple-400 dark:focus-visible:ring-purple-500/30",
    indigo:
      "focus-visible:border-indigo-500 focus-visible:ring-indigo-100 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-500/30",
  },
  option: {
    purple:
      "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    indigo:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
} as const;

export function DropdownMenu({
  value,
  options,
  pin,
  onChange,
  onOpenChange,
  className = "",
  focusColor = "indigo",
  canSearch = false,
  isSorted = true,
  size = "default",
  align = "left",
}: DropdownMenuProps) {
  const isCompact = size === "compact";
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 1. Sort and Pin Options
  let sortedOptions = isSorted
    ? [...options].sort((a, b) => a.label.localeCompare(b.label))
    : options;

  if (pin) {
    const withoutPin = sortedOptions.filter(
      (option) => option.value !== pin.value,
    );
    sortedOptions = [pin, ...withoutPin];
  }

  // 2. Fuse.js Search
  const fuse = new Fuse(sortedOptions, {
    keys: ["label", "searchTerms"],
    threshold: 0.4,
    ignoreLocation: true,
  });

  const filteredOptions = searchTerm.trim()
    ? fuse.search(searchTerm).map((result) => result.item)
    : sortedOptions;

  // 3. Selected Option
  const selectedOption = sortedOptions.find((option) => option.value === value);

  // 4. Get CSS Classes
  const dropdownColorClass =
    FOCUS_COLOR_CLASSES.dropdown[
      focusColor as keyof typeof FOCUS_COLOR_CLASSES.dropdown
    ] || FOCUS_COLOR_CLASSES.dropdown.indigo;

  const optionColorClass =
    FOCUS_COLOR_CLASSES.option[
      focusColor as keyof typeof FOCUS_COLOR_CLASSES.option
    ] || FOCUS_COLOR_CLASSES.option.indigo;

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onOpenChange]);

  // Keyboard navigation - only attach when dropdown is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredOptions.length === 0) return;

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (filteredOptions[focusedIndex]) {
            handleOptionClick(filteredOptions[focusedIndex].value);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          onOpenChange?.(false);
          setSearchTerm("");
          setFocusedIndex(0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredOptions, focusedIndex, onOpenChange]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(0);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      const newIsOpen = !prev;

      if (newIsOpen) {
        // Set focus to currently selected option when opening
        const selectedIndex = filteredOptions.findIndex(
          (option) => option.value === value,
        );
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);

        if (canSearch) {
          // Focus search input when opening dropdown
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 250);
        }
      } else {
        // Clear search when closing dropdown
        setTimeout(() => {
          setSearchTerm("");
          setFocusedIndex(0);
        }, 300);
      }

      onOpenChange?.(newIsOpen);
      return newIsOpen;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFocusedIndex(0);
  };

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({
        block: "center",
        behavior: "instant",
      });
    }
  }, [focusedIndex, isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className={`w-full cursor-pointer appearance-none rounded-xl border-2 border-gray-200 bg-white text-left shadow-sm transition-colors duration-300 hover:border-gray-300 focus-visible:ring-4 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 ${isCompact ? "p-2 text-sm" : "p-3"} ${dropdownColorClass}`}
      >
        <div className="flex items-center justify-between">
          <span
            className="truncate text-gray-900 transition-colors duration-300 dark:text-slate-300"
            title={selectedOption?.label}
          >
            {selectedOption?.label}
          </span>
          <ChevronDown
            className={`text-gray-400 transition-transform duration-300 ease-out ${isCompact ? "h-4 w-4" : "h-5 w-5"} ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </button>

      {/* Dropdown Options */}
      <div
        className={`absolute top-full z-50 mt-1 w-full min-w-42.5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl transition-all duration-300 ease-out dark:border-slate-700 dark:bg-slate-800 ${align === "right" ? "right-0" : "left-0"} ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
        style={{
          transformOrigin: "top center",
        }}
      >
        {/* Search Bar */}
        {canSearch && (
          <div className="border-b border-gray-100 p-2 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                tabIndex={isOpen ? 0 : -1}
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={t("dropdown.search")}
                className="w-full rounded-lg border border-gray-200 py-2 pr-3 pl-9 text-sm focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:placeholder:text-slate-500 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-500/30"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        <div
          className={`overflow-y-auto transition-all duration-300 ease-out ${isCompact ? "max-h-48" : "max-h-60"} ${
            isOpen ? "animate-slide-down" : ""
          }`}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-gray-500 dark:text-slate-400">
              {t("dropdown.noOptionsFound")}
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <button
                key={option.value}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                type="button"
                tabIndex={isOpen ? 0 : -1}
                onClick={() => handleOptionClick(option.value)}
                className={`w-full truncate text-left text-sm transition-colors duration-300 focus:outline-none ${isCompact ? "px-2.5 py-1.5" : "px-3 py-2.5"} ${
                  option.value === value
                    ? `${optionColorClass} font-medium` // priority to selected option CSS than focused option CSS
                    : index === focusedIndex
                      ? "bg-gray-100 dark:bg-slate-700"
                      : "text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700"
                } ${index === 0 && !canSearch ? "rounded-t-xl" : ""} ${
                  index === filteredOptions.length - 1 ? "rounded-b-xl" : ""
                }`}
                title={option.label}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
