import { SelectionCheckbox } from "@/components/ui";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HistoryBulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onBulkDeleteClick: () => void;
}

export function HistoryBulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onBulkDeleteClick,
}: HistoryBulkActionsProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-[164px] z-10 mx-4 mt-2 rounded-xl border border-indigo-300 bg-indigo-50 p-3 shadow-sm">
      <div className="flex justify-between">
        <div className="flex flex-col items-start gap-2">
          <span className="text-sm font-medium text-indigo-900">
            {t("history:selectedCount", { count: selectedCount })}
          </span>
          <button
            onClick={onSelectAll}
            className="flex cursor-pointer items-center gap-2"
          >
            <SelectionCheckbox isSelected={selectedCount === totalCount} />
            <span className="text-xs font-medium text-indigo-600">
              {selectedCount === totalCount
                ? t("history:deselectAll")
                : t("history:selectAll")}
            </span>
          </button>
        </div>
        <button
          onClick={onBulkDeleteClick}
          className="h-fit cursor-pointer rounded-lg border border-red-300 bg-red-100 p-3 text-xs text-red-600 transition-all duration-200 hover:bg-red-200 hover:shadow-sm"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
