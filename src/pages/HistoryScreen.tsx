import { BackButton, ConfirmDialog, HistoryEntryCard } from "@/components";
import { SelectionCheckbox } from "@/components/ui";
import { SearchOperatorType } from "@/constants";
import { useDebounce } from "@/hooks";
import {
  clearHistory,
  getHistoryEntryStatistics,
  removeHistoryEntries,
  removeHistoryEntry,
  searchHistory,
  togglePinEntry,
} from "@/services";
import { HistoryEntry } from "@/types";
import { ChartPie, Clock, HardDrive, Search, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

export function HistoryScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<HistoryEntry[]>([]); // displayed result
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set(),
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [historyEntryStats, setHistoryEntryStats] = useState<{
    historyEntryCount: number;
    historySize: string;
    historySizeUnit: string;
  } | null>(null);
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Check if this page is navigated from statistics page
  const isFromStatistics = (location.state as any)?.fromStatistics === true;

  // Initialize search query from navigation from statistics screen
  useEffect(() => {
    const state = location.state as {
      searchQueryForStatistics?: string;
    } | null;
    if (state?.searchQueryForStatistics) {
      setSearchQuery(state.searchQueryForStatistics);
      // Clear the state to prevent re-applying on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Restore previous search query (if have) when returning from detail screen
  // at component mount
  useEffect(() => {
    const savedSearchQuery = sessionStorage.getItem("historyScreenSearchQuery");

    if (savedSearchQuery) {
      setSearchQuery(savedSearchQuery);
      sessionStorage.removeItem("historyScreenSearchQuery");
    }
  }, []);

  // Load and search history entries
  useEffect(() => {
    displayResultedEntry();
  }, [debouncedSearchQuery]);

  // after got the displayed entries, restore scroll position
  useEffect(() => {
    if (!shouldRestoreScroll) return;

    const savedScrollPosition = sessionStorage.getItem(
      "historyScreenScrollPosition",
    );
    setTimeout(() => {
      if (savedScrollPosition && scrollContainerRef.current) {
        const scrollTop = parseInt(savedScrollPosition, 10);
        scrollContainerRef.current.scrollTop = scrollTop;
        sessionStorage.removeItem("historyScreenScrollPosition");
      }
    }, 300); // rule of thumb: wait a little bit because of race condition stuff of DOM render
    setShouldRestoreScroll(false);
  }, [shouldRestoreScroll]);

  const displayResultedEntry = async () => {
    try {
      const historyEntries = await searchHistory(debouncedSearchQuery);
      setEntries(historyEntries);
      setShouldRestoreScroll(true);

      // Update storage usage based on displayed entries
      const historyEntryStats = getHistoryEntryStatistics(historyEntries);
      setHistoryEntryStats(historyEntryStats);
    } catch (error) {
      console.error("Failed to load history:", error);
      setEntries([]);
    }
  };

  const handleConfirmClearHistory = async () => {
    try {
      await clearHistory();
      setEntries([]);
      setSelectedEntries(new Set());
      setHistoryEntryStats(null);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const handleRemoveEntry = async (
    entryId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation(); // Prevent triggering the entry selection
    try {
      await removeHistoryEntry(entryId);
      await displayResultedEntry();
    } catch (error) {
      console.error("Failed to remove history entry:", error);
    }
  };

  const handlePinEntry = async (entryId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the entry selection
    try {
      await togglePinEntry(entryId);
      await displayResultedEntry();
    } catch (error) {
      console.error("Failed to toggle pin status:", error);
    }
  };

  const savePreviousStates = () => {
    if (scrollContainerRef.current) {
      sessionStorage.setItem(
        "historyScreenScrollPosition",
        scrollContainerRef.current.scrollTop.toString(),
      );
    }
    if (searchQuery) {
      sessionStorage.setItem("historyScreenSearchQuery", searchQuery);
    }
  };

  const customNavigate = (path: string, options?: any) => {
    savePreviousStates();
    navigate(path, options);
  };

  const handleEntryClick = (entry: HistoryEntry) => {
    // If in selection mode, toggle selection instead of navigating
    if (selectedEntries.size > 0) {
      handleToggleSelection(entry.id);
      return;
    }

    // otherwise, navigating to detail screen
    // but save some states before navigating
    customNavigate(`/history/${entry.id}`, { state: { entry } });
  };

  const handleToggleSelection = (entryId: string) => {
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

  const handleSelectAll = () => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map((e) => e.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.size === entries.length) {
      // If all entries are selected, treat as clear all
      handleConfirmClearHistory();
      return;
    }
    try {
      // Delete all selected entries in a single operation
      await removeHistoryEntries(Array.from(selectedEntries));
      setSelectedEntries(new Set());
      setShowBulkDeleteConfirm(false);
      await displayResultedEntry();
    } catch (error) {
      console.error("Failed to delete selected entries:", error);
    }
  };

  const handleLanguageBadgeClick = (
    event: React.MouseEvent,
    operatorType: SearchOperatorType,
    langCode: string,
  ) => {
    event.stopPropagation(); // Prevent triggering the entry click

    const operator = `${operatorType}:${langCode}`;
    const currentQuery = searchQuery.trim();

    // Check if this operator already exists in the search
    const operatorRegex = new RegExp(`\\b${operatorType}:[a-zA-Z-]+\\b`, "gi");

    // Check if the operator already exists
    if (operatorRegex.test(currentQuery)) return;

    // Add new operator
    const newQuery = currentQuery ? `${operator} ${currentQuery}` : operator;
    setSearchQuery(newQuery);
  };

  return (
    <div
      ref={scrollContainerRef}
      className="animate-slide-in-right h-full w-full overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-indigo-100 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <BackButton />
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h1 className="text-lg font-semibold text-gray-800">
                {t("history:title")}
              </h1>
            </div>
          </div>

          {entries.length > 0 && (
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="flex cursor-pointer items-center space-x-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-500 transition-all duration-200 hover:bg-red-100 hover:shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">{t("history:clearAll")}</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("history:searchPlaceholder")}
              className="w-full rounded-xl border border-gray-200 bg-white/80 py-2 pr-10 pl-10 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-100"
                title="Clear search"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Storage Usage Info */}
      {historyEntryStats && historyEntryStats.historyEntryCount !== 0 && (
        <div className="sticky top-[118px] z-10 mx-4 mt-4 rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Statistics / Storage Usage Toggle Title */}
            {!isFromStatistics ? (
              <div
                className="group relative flex w-40 cursor-pointer overflow-hidden"
                onClick={() => customNavigate("/statistics")}
              >
                <div
                  className="absolute left-0 flex w-40 -translate-x-40 items-center space-x-2 transition-transform duration-300 group-hover:translate-x-0"
                  title={t("statistics:statistics")}
                >
                  <ChartPie className="h-4 w-4 shrink-0 text-indigo-600" />
                  <span className="truncate text-sm font-medium text-indigo-600">
                    {t("statistics:statistics")}
                  </span>
                </div>
                <div
                  className="flex w-40 translate-x-0 items-center justify-start space-x-2 transition-transform duration-300 group-hover:translate-x-40"
                  title={t("history:storageUsage")}
                >
                  <HardDrive className="h-4 w-4 shrink-0 text-gray-500" />
                  <span className="truncate text-sm font-medium text-gray-700">
                    {t("history:storageUsage")}
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center justify-start space-x-2"
                title={t("history:storageUsage")}
              >
                <HardDrive className="h-4 w-4 shrink-0 text-gray-500" />
                <span className="truncate text-sm font-medium text-gray-700">
                  {t("history:storageUsage")}
                </span>
              </div>
            )}

            {/* Storage Usage Details */}
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <span
                className="max-w-16 truncate"
                title={t("history:entriesCount", {
                  count: historyEntryStats.historyEntryCount,
                })}
              >
                {t("history:entriesCount", {
                  count: historyEntryStats.historyEntryCount,
                })}
              </span>
              <span
                className="max-w-16 truncate font-medium"
                title={`${historyEntryStats.historySize} ${historyEntryStats.historySizeUnit}`}
              >
                {historyEntryStats.historySize}{" "}
                {historyEntryStats.historySizeUnit}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedEntries.size > 0 && (
        <div className="sticky top-[164px] z-10 mx-4 mt-2 rounded-xl border border-indigo-300 bg-indigo-50 p-3 shadow-sm">
          <div className="flex justify-between">
            <div className="flex flex-col items-start gap-2">
              <span className="text-sm font-medium text-indigo-900">
                {t("history:selectedCount", { count: selectedEntries.size })}
              </span>
              <button
                onClick={handleSelectAll}
                className="flex cursor-pointer items-center gap-2"
              >
                <SelectionCheckbox
                  isSelected={selectedEntries.size === entries.length}
                />
                <span className="text-xs font-medium text-indigo-600">
                  {selectedEntries.size === entries.length
                    ? t("history:deselectAll")
                    : t("history:selectAll")}
                </span>
              </button>
            </div>
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="h-fit cursor-pointer rounded-lg border border-red-300 bg-red-100 p-3 text-xs text-red-600 transition-all duration-200 hover:bg-red-200 hover:shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
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
                onEntryClick={handleEntryClick}
                onToggleSelection={handleToggleSelection}
                onPinEntry={handlePinEntry}
                onRemoveEntry={handleRemoveEntry}
                onLanguageBadgeClick={handleLanguageBadgeClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog for Clear All */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmClearHistory}
        title={t("history:confirmClearAllTitle")}
        message={t("history:confirmClearAllMessage")}
        confirmText={t("history:clearAll")}
        cancelText={t("common:cancel")}
        variant="danger"
      />

      {/* Confirm Dialog for Bulk Delete */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title={
          selectedEntries.size === entries.length
            ? t("history:confirmClearAllTitle")
            : t("history:confirmBulkDeleteTitle", {
                count: selectedEntries.size,
              })
        }
        message={
          selectedEntries.size === entries.length
            ? t("history:confirmClearAllMessage")
            : t("history:confirmBulkDeleteMessage", {
                count: selectedEntries.size,
              })
        }
        confirmText={
          selectedEntries.size === entries.length
            ? t("history:clearAll")
            : t("history:deleteSelected")
        }
        cancelText={t("common:cancel")}
        variant="danger"
      />
    </div>
  );
}
