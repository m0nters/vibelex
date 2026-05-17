import Fuse from "fuse.js";
import { ChevronDown, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  className?: string;
  focusColor?: string;
  canSearch?: boolean;
  isSorted?: boolean;
}

// Move color classes outside component to avoid recreation
const FOCUS_COLOR_CLASSES = {
  dropdown: {
    purple: "focus:border-purple-500 focus:ring-purple-100",
    indigo: "focus:border-indigo-500 focus:ring-indigo-100",
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
  className = "",
  focusColor = "indigo",
  canSearch = false,
  isSorted = true,
}: DropdownMenuProps) {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Memoize sorted and pinned options - only recalculate when options or pin changes
  const sortedOptions = useMemo(() => {
    let result = isSorted
      ? [...options].sort((a, b) => a.label.localeCompare(b.label))
      : options;

    // If pin option is provided, place it at the top
    if (pin) {
      // Remove pin from options if it exists to avoid duplication
      const withoutPin = result.filter((option) => option.value !== pin.value);
      result = [pin, ...withoutPin];
    }

    return result;
  }, [options, pin, isSorted]);

  // Memoize Fuse.js instance for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(sortedOptions, {
        keys: ["label", "searchTerms"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [sortedOptions],
  );

  // Memoize filtered options using Fuse.js for fuzzy + transliteration search
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return sortedOptions;
    return fuse.search(searchTerm).map((result) => result.item);
  }, [sortedOptions, searchTerm, fuse]);

  // Memoize selected option - find from original sortedOptions, not filtered
  const selectedOption = useMemo(
    () => sortedOptions.find((option) => option.value === value),
    [sortedOptions, value],
  );

  // Memoize color classes
  const dropdownColorClass = useMemo(
    () =>
      FOCUS_COLOR_CLASSES.dropdown[
        focusColor as keyof typeof FOCUS_COLOR_CLASSES.dropdown
      ] || FOCUS_COLOR_CLASSES.dropdown.indigo,
    [focusColor],
  );

  const optionColorClass = useMemo(
    () =>
      FOCUS_COLOR_CLASSES.option[
        focusColor as keyof typeof FOCUS_COLOR_CLASSES.option
      ] || FOCUS_COLOR_CLASSES.option.indigo,
    [focusColor],
  );

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          setSearchTerm("");
          setFocusedIndex(0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredOptions, focusedIndex]); // Include all dependencies

  // Memoize handlers to avoid recreating functions
  const handleOptionClick = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm("");
      setFocusedIndex(0);
    },
    [onChange],
  );

  const toggleDropdown = useCallback(() => {
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

      return newIsOpen;
    });
  }, [canSearch, filteredOptions, value]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setFocusedIndex(0); // Reset focus to first option when search changes
    },
    [],
  );

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
        type="button"
        onClick={toggleDropdown}
        className={`w-full cursor-pointer appearance-none rounded-xl border-2 border-gray-200 bg-white p-3 text-left shadow-sm transition-colors duration-300 hover:border-gray-300 focus:ring-4 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 ${dropdownColorClass}`}
      >
        <div className="flex items-center justify-between">
          <span
            className="truncate text-gray-900 dark:text-slate-300"
            title={selectedOption?.label}
          >
            {selectedOption?.label}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ease-out ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </button>

      {/* Dropdown Options */}
      <div
        className={`absolute top-full right-0 left-0 z-50 mt-1 min-w-[170px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl transition-all duration-300 ease-out dark:border-slate-700 dark:bg-slate-800 ${
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
                value={searchTerm}
                onChange={handleSearchChange}
                // onKeyDown={handleKeyDown}
                placeholder={t("dropdown.search")}
                className="w-full rounded-lg border border-gray-200 py-2 pr-3 pl-9 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:placeholder:text-slate-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        <div
          className={`max-h-60 overflow-y-auto transition-all duration-300 ease-out ${
            isOpen ? "animate-slide-down" : "animate-slide-up"
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
                onClick={() => handleOptionClick(option.value)}
                className={`w-full truncate px-3 py-2.5 text-left text-sm transition-colors duration-150 focus:outline-none ${
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
