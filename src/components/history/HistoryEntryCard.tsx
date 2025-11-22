import { SelectionCheckbox } from "@/components/ui";
import { SearchOperatorType } from "@/constants";
import { getDisplayText } from "@/services";
import { HistoryEntry } from "@/types";
import { formatTimestampDetail } from "@/utils";
import { ArrowRight, Clock, Globe, Pin, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

interface HistoryEntryCardProps {
  entry: HistoryEntry;
  isSelected: boolean;
  onEntryClick: (entry: HistoryEntry) => void;
  onToggleSelection: (entryId: string) => void;
  onPinEntry: (entryId: string, event: React.MouseEvent) => void;
  onRemoveEntry: (entryId: string, event: React.MouseEvent) => void;
  onLanguageBadgeClick: (
    event: React.MouseEvent,
    operatorType: SearchOperatorType,
    langCode: string,
  ) => void;
}

export function HistoryEntryCard({
  entry,
  isSelected,
  onEntryClick,
  onToggleSelection,
  onPinEntry,
  onRemoveEntry,
  onLanguageBadgeClick,
}: HistoryEntryCardProps) {
  const { t, i18n } = useTranslation();
  const displayInfo = getDisplayText(entry);

  // Get translated language names using i18n
  const sourceLangCode = entry.translation.source_language_code;
  const translatedLangCode = entry.translation.translated_language_code;
  const sourceLangName = t(`languages:${sourceLangCode}`);
  const targetLangName = t(`languages:${translatedLangCode}`);

  const isSourceLanguageUnknown = sourceLangName === t("languages:unknown");

  const handleSelectionClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onToggleSelection(entry.id);
  };

  const formatTimestampForBadge = (timestamp: number, locale: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    const timeString = date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffInHours < 24) {
      return timeString;
    } else if (diffInHours < 24 * 7) {
      const weekday = date.toLocaleDateString(locale, { weekday: "short" });
      return `${weekday} ${timeString}`; // Weekday + time
    } else {
      const dateString = date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      });
      return `${dateString} ${timeString}`; // Month day + time
    }
  };

  return (
    <div
      key={entry.id}
      onClick={() => onEntryClick(entry)}
      className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-300 active:scale-95 ${
        isSelected
          ? "border-indigo-400 bg-indigo-50/80 shadow-lg shadow-indigo-100/50"
          : "border-gray-200 bg-white/60 hover:border-indigo-300 hover:bg-white/80 hover:shadow-xl hover:shadow-indigo-100/50"
      }`}
    >
      {/* Selection Circle - appears on hover or when selected */}
      <SelectionCheckbox
        isSelected={isSelected}
        onClick={handleSelectionClick}
        className={`absolute top-3 left-3 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        title={
          isSelected ? t("history:deselectEntry") : t("history:selectEntry")
        }
      />

      <div className="flex items-center justify-between">
        {/* Main info section */}
        <div className="min-w-0 flex-1">
          <div className="mb-2">
            <h3
              className="max-w-60 truncate text-base font-semibold text-gray-800 transition-colors group-hover:text-indigo-800"
              title={displayInfo.primaryText}
            >
              {displayInfo.primaryText}
            </h3>
            {displayInfo.secondaryText && (
              <p
                className="max-w-60 truncate font-mono text-sm text-gray-500"
                title={displayInfo.secondaryText}
              >
                {displayInfo.secondaryText}
              </p>
            )}
          </div>

          {/* Language pair and timestamp */}
          <div className="mt-3 flex flex-col items-start justify-between space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              {/* Source Language Badge */}
              <div
                onClick={(e) =>
                  onLanguageBadgeClick(e, "source", sourceLangCode)
                }
                className={`flex max-w-28 cursor-pointer items-center space-x-1.5 rounded-full border px-2 py-1 transition-all duration-200 ${isSourceLanguageUnknown ? "border-gray-300 bg-gray-100 hover:bg-gray-200 hover:shadow-none" : "border-blue-300 bg-blue-100 hover:bg-blue-200 hover:shadow-sm"}`}
                title={t("history:searchBySourceLanguage", {
                  language: sourceLangName,
                })}
              >
                <Globe
                  className={`h-3.5 w-3.5 ${isSourceLanguageUnknown ? "text-gray-500" : "text-blue-600"}`}
                />
                <span
                  className={`truncate font-semibold ${isSourceLanguageUnknown ? "text-gray-500" : "text-blue-700"}`}
                >
                  {sourceLangName}
                </span>
              </div>

              {/* Arrow */}
              <ArrowRight className="h-4 w-4 text-indigo-400" />

              {/* Target Language Badge */}
              <div
                onClick={(e) =>
                  onLanguageBadgeClick(e, "target", translatedLangCode)
                }
                className="flex max-w-28 cursor-pointer items-center space-x-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-1 transition-all duration-200 hover:bg-emerald-200 hover:shadow-sm"
                title={t("history:searchByTargetLanguage", {
                  language: targetLangName,
                })}
              >
                <Globe className="h-3.5 w-3.5 text-emerald-600" />
                <span className="truncate font-semibold text-emerald-700">
                  {targetLangName}
                </span>
              </div>
            </div>

            {/* Timestamp Badge */}
            <div
              className="flex cursor-help items-center space-x-1.5 rounded-full border border-gray-300 bg-gray-100 px-2 py-1"
              title={formatTimestampDetail(entry.timestamp, i18n.language)}
            >
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              <span className="font-medium text-gray-600">
                {formatTimestampForBadge(entry.timestamp, i18n.language)}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col space-y-4">
          {/* Pin button */}
          <button
            onClick={(e) => onPinEntry(entry.id, e)}
            className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-sm ${
              entry.pinnedAt
                ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                : "border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            title={
              entry.pinnedAt ? t("history:unpinEntry") : t("history:pinEntry")
            }
          >
            <Pin
              className={`h-4 w-4 ${entry.pinnedAt ? "fill-current" : ""}`}
            />
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => onRemoveEntry(entry.id, e)}
            className="cursor-pointer rounded-lg border border-red-200 bg-red-50 p-3 text-red-500 transition-all duration-200 hover:bg-red-100 hover:shadow-sm"
            title={t("history:removeEntry")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
