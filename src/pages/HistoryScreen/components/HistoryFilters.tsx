import { ArrowDown, ArrowDownAZ, ArrowUp, CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";

export type SortOrder =
  | "date_desc"
  | "date_asc"
  | "alphabet_asc"
  | "alphabet_desc";

interface HistoryFiltersProps {
  sortBy: SortOrder;
  onSortChange: (sort: SortOrder) => void;
}

export function HistoryFilters({ sortBy, onSortChange }: HistoryFiltersProps) {
  const { t } = useTranslation();

  const handleSortClick = (type: "date" | "alphabet") => {
    if (type === "date") {
      onSortChange(sortBy === "date_desc" ? "date_asc" : "date_desc");
    } else {
      onSortChange(
        sortBy === "alphabet_asc" ? "alphabet_desc" : "alphabet_asc",
      );
    }
  };

  return (
    <div className="mx-4 mt-3 flex items-center justify-end">
      <div className="flex w-full items-center justify-between space-x-2 rounded-xl border border-gray-300 bg-white p-1.5 shadow-sm sm:w-auto sm:justify-end">
        <button
          onClick={() => handleSortClick("date")}
          className={`flex flex-1 items-center justify-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none ${
            sortBy.startsWith("date")
              ? "border border-indigo-100 bg-indigo-50 text-indigo-700 shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title={
            sortBy === "date_desc"
              ? t("common:sortDateAsc")
              : t("common:sortDateDesc")
          }
        >
          <CalendarDays className="h-4 w-4" />
          <span>{t("common:date")}</span>
          {sortBy.startsWith("date") &&
            (sortBy === "date_desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUp className="h-3 w-3" />
            ))}
        </button>
        <button
          onClick={() => handleSortClick("alphabet")}
          className={`flex flex-1 items-center justify-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none ${
            sortBy.startsWith("alphabet")
              ? "border border-indigo-100 bg-indigo-50 text-indigo-700 shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title={
            sortBy === "alphabet_asc"
              ? t("common:sortAlphabetDesc")
              : t("common:sortAlphabetAsc")
          }
        >
          <ArrowDownAZ className="h-4 w-4" />
          <span>{t("common:alphabet")}</span>
          {sortBy.startsWith("alphabet") &&
            (sortBy === "alphabet_asc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUp className="h-3 w-3" />
            ))}
        </button>
      </div>
    </div>
  );
}
