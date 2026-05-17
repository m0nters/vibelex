import { ConfirmDialog } from "@/components";
import { SelectionCheckbox } from "@/components/ui";
import { clearHistory, removeHistoryEntries } from "@/services";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface HistoryBulkActionsProps {
  selectedEntries: Set<string>;
  totalCount: number;
  onSelectAll: () => void;
  onDeleted: () => void;
  onBeforeAction: () => void;
}

export function HistoryBulkActions({
  selectedEntries,
  totalCount,
  onSelectAll,
  onDeleted,
  onBeforeAction,
}: HistoryBulkActionsProps) {
  const { t } = useTranslation();
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const selectedCount = selectedEntries.size;

  const handleBulkDelete = async () => {
    if (selectedCount === totalCount) {
      try {
        await clearHistory();
        onDeleted();
        setShowBulkDeleteConfirm(false);
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
      return;
    }

    onBeforeAction();
    try {
      await removeHistoryEntries(Array.from(selectedEntries));
      onDeleted();
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete selected entries:", error);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-[164px] z-10 mx-4 mt-2 rounded-xl border border-indigo-300 bg-indigo-50 p-3 shadow-sm transition-colors duration-300 dark:border-indigo-900/50 dark:bg-slate-800">
      <div className="flex justify-between">
        <div className="flex flex-col items-start gap-2">
          <span className="text-sm font-medium text-indigo-900 transition-colors duration-300 dark:text-indigo-300">
            {t("history:selectedCount", { count: selectedCount })}
          </span>
          <button
            onClick={onSelectAll}
            className="flex cursor-pointer items-center gap-2"
          >
            <SelectionCheckbox isSelected={selectedCount === totalCount} />
            <span className="text-xs font-medium text-indigo-600 transition-colors duration-300 dark:text-indigo-400">
              {selectedCount === totalCount
                ? t("history:deselectAll")
                : t("history:selectAll")}
            </span>
          </button>
        </div>
        <button
          onClick={() => setShowBulkDeleteConfirm(true)}
          className="h-fit cursor-pointer rounded-lg border border-red-300 bg-red-100 p-3 text-xs text-red-600 transition-all duration-300 hover:bg-red-200 hover:shadow-sm dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title={
          selectedCount === totalCount
            ? t("history:confirmClearAllTitle")
            : t("history:confirmBulkDeleteTitle", { count: selectedCount })
        }
        message={
          selectedCount === totalCount
            ? t("history:confirmClearAllMessage")
            : t("history:confirmBulkDeleteMessage", { count: selectedCount })
        }
        confirmText={
          selectedCount === totalCount
            ? t("history:clearAll")
            : t("history:deleteSelected")
        }
        cancelText={t("common:cancel")}
        variant="danger"
      />
    </div>
  );
}
