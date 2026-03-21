import { ConfirmDialog } from "@/components";
import { useDebounce } from "@/hooks";
import {
  clearHistory,
  getDisplayText,
  getHistoryEntryStatistics,
  removeHistoryEntries,
  removeHistoryEntry,
  searchHistory,
  togglePinEntry,
} from "@/services";
import { HistoryEntry } from "@/types";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HistoryBulkActions,
  HistoryFilters,
  HistoryHeader,
  HistoryList,
  HistoryStorageInfo,
  SortOrder,
} from "./components";

export function HistoryScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set(),
  );
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<SortOrder>("date_desc");

  // @ts-ignore
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [historyEntryStats, setHistoryEntryStats] = useState<{
    historyEntryCount: number;
    historySize: string;
    historySizeUnit: string;
  } | null>(null);
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isFromStatistics = (location.state as any)?.fromStatistics === true;

  // Sorting logic
  const sortedEntries = useMemo(() => {
    const sorted = [...entries];
    if (sortBy.startsWith("alphabet")) {
      sorted.sort((a, b) => {
        const compare = getDisplayText(a).primaryText.localeCompare(
          getDisplayText(b).primaryText,
          undefined,
          {
            sensitivity: "variant",
            numeric: true,
            ignorePunctuation: true,
          },
        );
        return sortBy === "alphabet_asc" ? compare : -compare;
      });
    } else {
      // date
      sorted.sort((a, b) => {
        return sortBy === "date_desc"
          ? b.timestamp - a.timestamp
          : a.timestamp - b.timestamp;
      });
    }
    return sorted;
  }, [entries, sortBy]);

  useEffect(() => {
    const state = location.state as {
      searchQueryForStatistics?: string;
    } | null;
    if (state?.searchQueryForStatistics) {
      setSearchQuery(state.searchQueryForStatistics);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const savedSearchQuery = sessionStorage.getItem("historyScreenSearchQuery");

    if (savedSearchQuery) {
      setSearchQuery(savedSearchQuery);
      sessionStorage.removeItem("historyScreenSearchQuery");
    }
  }, []);

  useEffect(() => {
    displayResultedEntry();
  }, [debouncedSearchQuery]);

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
    }, 300);
    setShouldRestoreScroll(false);
  }, [shouldRestoreScroll]);

  const displayResultedEntry = async () => {
    setIsLoading(true);
    try {
      const historyEntries = await searchHistory(debouncedSearchQuery);
      setEntries(historyEntries);
      setShouldRestoreScroll(true);

      const stats = getHistoryEntryStatistics(historyEntries);
      setHistoryEntryStats(stats);
    } catch (error) {
      console.error("Failed to load history:", error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmClearHistory = async () => {
    try {
      await clearHistory();
      setEntries([]);
      setSelectedEntries(new Set());
      setLastSelectedIndex(null);
      setHistoryEntryStats(null);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const handleRemoveEntry = async (
    entryId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    saveScrollPosition();
    try {
      await removeHistoryEntry(entryId);
      await displayResultedEntry();
    } catch (error) {
      console.error("Failed to remove history entry:", error);
    }
  };

  const handlePinEntry = async (entryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    saveScrollPosition();
    try {
      await togglePinEntry(entryId);
      await displayResultedEntry();
    } catch (error) {
      console.error("Failed to toggle pin status:", error);
    }
  };

  const saveScrollPosition = () => {
    if (scrollContainerRef.current) {
      sessionStorage.setItem(
        "historyScreenScrollPosition",
        scrollContainerRef.current.scrollTop.toString(),
      );
    }
  };

  const savePreviousStates = () => {
    saveScrollPosition();
    if (searchQuery) {
      sessionStorage.setItem("historyScreenSearchQuery", searchQuery);
    }
  };

  const customNavigate = (path: string, options?: any) => {
    savePreviousStates();
    navigate(path, options);
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
      rangeIds = sortedEntries
        .slice(lastSelectedIndex + 1, currentIndex + 1)
        .map((e) => e.id);
    } else {
      rangeIds = sortedEntries
        .slice(currentIndex, lastSelectedIndex)
        .map((e) => e.id);
    }

    setSelectedEntries((prev) => {
      const newSet = new Set(prev);
      const hasAllSelected = rangeIds.every((id) => newSet.has(id));

      if (hasAllSelected) {
        rangeIds.forEach((id) => newSet.delete(id));
        newSet.delete(sortedEntries[lastSelectedIndex].id);
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
    const currentIndex = sortedEntries.findIndex((e) => e.id === entryId);

    if (event?.shiftKey && lastSelectedIndex !== null) {
      rangeSelect(currentIndex);
    } else {
      singleSelect(entryId);
    }

    setLastSelectedIndex(currentIndex);
  };

  const handleSelectAll = () => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
      setLastSelectedIndex(null);
    } else {
      setSelectedEntries(new Set(entries.map((e) => e.id)));
      setLastSelectedIndex(entries.length - 1);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.size === entries.length) {
      handleConfirmClearHistory();
      setShowBulkDeleteConfirm(false);
      return;
    }
    saveScrollPosition();
    try {
      await removeHistoryEntries(Array.from(selectedEntries));
      setSelectedEntries(new Set());
      setLastSelectedIndex(null);
      setShowBulkDeleteConfirm(false);
      await displayResultedEntry();
    } catch (error) {
      console.error("Failed to delete selected entries:", error);
    }
  };

  const handleLanguageBadgeClick = (
    event: React.MouseEvent,
    operatorType: string,
    langCode: string,
  ) => {
    event.stopPropagation();

    const operator = `${operatorType}:${langCode}`;
    const currentQuery = searchQuery.trim();
    const operatorRegex = new RegExp(`\\b${operatorType}:[a-zA-Z-]+\\b`, "gi");

    if (operatorRegex.test(currentQuery)) return;

    const newQuery = currentQuery ? `${operator} ${currentQuery}` : operator;
    setSearchQuery(newQuery);
  };

  return (
    <div
      ref={scrollContainerRef}
      className="animate-slide-in-right h-full w-full overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 select-none"
    >
      <HistoryHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasEntries={entries.length > 0}
        onClearAllClick={() => setShowConfirmDialog(true)}
      />

      {historyEntryStats &&
        historyEntryStats.historyEntryCount !== 0 &&
        !isLoading && (
          <>
            <HistoryStorageInfo
              historyEntryCount={historyEntryStats.historyEntryCount}
              historySize={historyEntryStats.historySize}
              historySizeUnit={historyEntryStats.historySizeUnit}
              isFromStatistics={isFromStatistics}
              onNavigateToStatistics={() => customNavigate("/statistics")}
            />
            <HistoryFilters sortBy={sortBy} onSortChange={setSortBy} />
          </>
        )}

      <HistoryBulkActions
        selectedCount={selectedEntries.size}
        totalCount={entries.length}
        onSelectAll={handleSelectAll}
        onBulkDeleteClick={() => setShowBulkDeleteConfirm(true)}
      />

      {!isLoading && (
        <HistoryList
          entries={sortedEntries}
          selectedEntries={selectedEntries}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onEntryClick={handleEntryClick}
          onToggleSelection={handleToggleSelection}
          onPinEntry={handlePinEntry}
          onRemoveEntry={handleRemoveEntry}
          // @ts-ignore
          onLanguageBadgeClick={handleLanguageBadgeClick}
        />
      )}

      {isLoading && (
        <HistoryList
          entries={[]}
          selectedEntries={new Set()}
          searchQuery={""}
          isLoading={true}
          onEntryClick={() => {}}
          onToggleSelection={() => {}}
          onPinEntry={() => {}}
          onRemoveEntry={() => {}}
          onLanguageBadgeClick={() => {}}
        />
      )}

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
