import { HistoryEntryCard } from "@/components";
import { SearchOperatorType } from "@/constants";
import { HistoryEntry } from "@/types";
import { Clock } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";

interface HistoryListProps {
  entries: HistoryEntry[];
  selectedEntries: Set<string>;
  searchQuery: string;
  isLoading: boolean;
  onEntryClick: (entry: HistoryEntry, event?: React.MouseEvent) => void;
  onToggleSelection: (entryId: string, event?: React.MouseEvent) => void;
  onPinEntry: (entryId: string, event: React.MouseEvent) => void;
  onRemoveEntry: (entryId: string, event: React.MouseEvent) => void;
  onLanguageBadgeClick: (
    event: React.MouseEvent,
    operatorType: SearchOperatorType,
    langCode: string,
  ) => void;
}

export function HistoryList({
  entries,
  selectedEntries,
  searchQuery,
  isLoading,
  onEntryClick,
  onToggleSelection,
  onPinEntry,
  onRemoveEntry,
  onLanguageBadgeClick,
}: HistoryListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-600"></div>
          </div>
          <p className="text-sm text-gray-500">{t("common:loading")}</p>
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
            <p className="text-gray-500">
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
              onEntryClick={onEntryClick}
              onToggleSelection={onToggleSelection}
              onPinEntry={onPinEntry}
              onRemoveEntry={onRemoveEntry}
              onLanguageBadgeClick={onLanguageBadgeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
