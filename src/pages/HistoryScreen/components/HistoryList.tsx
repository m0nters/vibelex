import { removeHistoryEntry, togglePinEntry } from "@/services";
import { HistoryEntry } from "@/types";
import { Clock } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HistoryEntryCard } from "./HistoryEntryCard";

interface HistoryListProps {
  entries: HistoryEntry[];
  selectedEntries: Set<string>;
  setSelectedEntries: React.Dispatch<React.SetStateAction<Set<string>>>;
  searchQuery: string;
  isLoading: boolean;
  onBeforeAction: () => void;
  onEntryModified: () => void;
  onLanguageBadgeClick: (
    event: React.MouseEvent,
    operatorType: string,
    langCode: string,
  ) => void;
  customNavigate: (path: string, options?: any) => void;
}

export function HistoryList({
  entries,
  selectedEntries,
  setSelectedEntries,
  searchQuery,
  isLoading,
  onBeforeAction,
  onEntryModified,
  onLanguageBadgeClick,
  customNavigate,
}: HistoryListProps) {
  const { t } = useTranslation();
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (selectedEntries.size === 0) {
      setLastSelectedIndex(null);
    }
  }, [selectedEntries]);

  const handleRemoveEntry = async (
    entryId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    onBeforeAction();
    try {
      await removeHistoryEntry(entryId);
      onEntryModified();
    } catch (error) {
      console.error("Failed to remove history entry:", error);
    }
  };

  const handlePinEntry = async (entryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onBeforeAction();
    try {
      await togglePinEntry(entryId);
      onEntryModified();
    } catch (error) {
      console.error("Failed to toggle pin status:", error);
    }
  };

  const handleEntryClick = (entry: HistoryEntry, event?: React.MouseEvent) => {
    if (selectedEntries.size > 0) {
      handleToggleSelection(entry.id, event);
      return;
    }
    customNavigate(`/history/${entry.id}`, { state: { entry } });
  };

  const rangeSelect = (currentIndex: number) => {
    if (lastSelectedIndex === null) return;
    let rangeIds: string[] = [];
    if (lastSelectedIndex < currentIndex) {
      rangeIds = entries
        .slice(lastSelectedIndex + 1, currentIndex + 1)
        .map((e) => e.id);
    } else {
      rangeIds = entries
        .slice(currentIndex, lastSelectedIndex)
        .map((e) => e.id);
    }

    setSelectedEntries((prev) => {
      const newSet = new Set(prev);
      const hasAllSelected = rangeIds.every((id) => newSet.has(id));
      if (hasAllSelected) {
        rangeIds.forEach((id) => newSet.delete(id));
        newSet.delete(entries[lastSelectedIndex].id);
      } else {
        rangeIds.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  const singleSelect = (entryId: string) => {
    setSelectedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const handleToggleSelection = (entryId: string, event?: React.MouseEvent) => {
    const currentIndex = entries.findIndex((e) => e.id === entryId);
    if (event?.shiftKey && lastSelectedIndex !== null) {
      rangeSelect(currentIndex);
    } else {
      singleSelect(entryId);
    }
    setLastSelectedIndex(currentIndex);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-600"></div>
          </div>
          <p className="text-sm text-gray-500 transition-colors duration-300 dark:text-slate-400">
            {t("common:loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="m-4 flex-1">
      {entries.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500 transition-colors duration-300 dark:text-slate-400">
              {searchQuery
                ? t("history:noSearchResults")
                : t("history:emptyHistory")}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <HistoryEntryCard
              key={entry.id}
              entry={entry}
              isSelected={selectedEntries.has(entry.id)}
              onEntryClick={handleEntryClick}
              onToggleSelection={handleToggleSelection}
              onPinEntry={handlePinEntry}
              onRemoveEntry={handleRemoveEntry}
              // @ts-ignore
              onLanguageBadgeClick={onLanguageBadgeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
