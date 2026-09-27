import { useDebounce } from "@/hooks";
import {
  getDisplayText,
  getHistoryEntryStatistics,
  searchHistory,
} from "@/services";
import { HistoryEntry } from "@/types";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  type Location,
  type NavigateOptions,
} from "react-router-dom";
import type { SortOrder } from "./components";
import {
  HistoryBulkActions,
  HistoryFilters,
  HistoryHeader,
  HistoryList,
  HistoryStorageInfo,
} from "./components";

interface HistoryScreenProps {
  location: Location;
}

export function HistoryScreen({ location }: HistoryScreenProps) {
  const navigate = useNavigate();
  const lastLoadedSearchQuery = useRef<string | null>(null);
  const appliedStatisticsSearchKey = useRef<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set(),
  );
  const [sortBy, setSortBy] = useState<SortOrder>("date_desc");

  const [isLoading, setIsLoading] = useState(false);
  const [historyEntryStats, setHistoryEntryStats] = useState<{
    historyEntryCount: number;
    historySize: string;
    historySizeUnit: string;
  } | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isFromStatistics = (location.state as any)?.fromStatistics === true;

  const getSortedEntries = (entries: HistoryEntry[], sortBy: SortOrder) => {
    const pinned = entries.filter((e) => e.pinnedAt);
    const unpinned = entries.filter((e) => !e.pinnedAt);

    const sortFn = (a: HistoryEntry, b: HistoryEntry) => {
      if (sortBy.startsWith("alphabet")) {
        const compare = getDisplayText(a).primaryText.localeCompare(
          getDisplayText(b).primaryText,
          undefined,
          { sensitivity: "variant", numeric: true, ignorePunctuation: true },
        );
        return sortBy === "alphabet_asc" ? compare : -compare;
      }
      return sortBy === "date_desc"
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp;
    };

    // Pinned entries: sort by pinnedAt descending (latest pin first),
    // then by the selected sort order as a tiebreaker.
    pinned.sort(
      (a, b) => (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0) || sortFn(a, b),
    );
    unpinned.sort(sortFn);

    return [...pinned, ...unpinned];
  };

  const sortedEntries = getSortedEntries(entries, sortBy);

  useEffect(() => {
    const state = location.state as {
      searchQueryForStatistics?: string;
    } | null;
    if (
      state?.searchQueryForStatistics &&
      appliedStatisticsSearchKey.current !== location.key
    ) {
      appliedStatisticsSearchKey.current = location.key;
      setSearchQuery(state.searchQueryForStatistics);
    }
  }, [location.key, location.state]);

  useEffect(() => {
    if (lastLoadedSearchQuery.current === debouncedSearchQuery) return;

    lastLoadedSearchQuery.current = debouncedSearchQuery;
    setSelectedEntries(new Set());
    displayResultedEntry();
  }, [debouncedSearchQuery]);

  // Handle Ctrl + A to select all entries
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.key !== "a") return;

      // Don't intercept when the user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (entries.length === 0) return;

      // Only activate select-all when already in bulk-select mode
      if (selectedEntries.size === 0) return;

      e.preventDefault();
      handleSelectAll();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [entries, selectedEntries]);

  const displayResultedEntry = async () => {
    setIsLoading(true);
    try {
      const historyEntries = await searchHistory(debouncedSearchQuery);
      setEntries(historyEntries);

      const stats = getHistoryEntryStatistics(historyEntries);
      setHistoryEntryStats(stats);
    } catch (error) {
      console.error("Failed to load history:", error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch entries silently (no loading spinner) to keep the list
  // mounted and preserve the current scroll position.
  const silentRefreshEntries = async () => {
    try {
      const historyEntries = await searchHistory(debouncedSearchQuery);
      setEntries(historyEntries);

      const stats = getHistoryEntryStatistics(historyEntries);
      setHistoryEntryStats(stats);
    } catch (error) {
      console.error("Failed to refresh history:", error);
    }
  };

  // Optimistically remove an entry from local state so the list
  // updates instantly without unmounting/remounting.
  const handleEntriesRemoved = (removedIds: string[]) => {
    const removedSet = new Set(removedIds);
    setEntries((prev) => {
      const next = prev.filter((e) => !removedSet.has(e.id));
      const stats = getHistoryEntryStatistics(next);
      setHistoryEntryStats(stats);
      return next;
    });
  };

  const customNavigate = (path: string, options?: NavigateOptions) => {
    navigate(path, options);
  };

  const handleSelectAll = () => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map((e) => e.id)));
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
      className="animate-slide-in-right h-full w-full overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 transition-colors duration-300 select-none dark:from-gray-900 dark:to-slate-900 dark:text-slate-300"
    >
      <HistoryHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasEntries={entries.length > 0}
        onCleared={() => {
          setEntries([]);
          setSelectedEntries(new Set());
          setHistoryEntryStats(null);
        }}
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
        selectedEntries={selectedEntries}
        totalCount={entries.length}
        onSelectAll={handleSelectAll}
        onDeleted={(deletedIds) => {
          setSelectedEntries(new Set());
          if (deletedIds) {
            handleEntriesRemoved(deletedIds);
          } else {
            // Full clear — no ids provided
            setEntries([]);
            setHistoryEntryStats(null);
          }
        }}
      />

      {!isLoading && (
        <HistoryList
          entries={sortedEntries}
          selectedEntries={selectedEntries}
          setSelectedEntries={setSelectedEntries}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onEntryRemoved={handleEntriesRemoved}
          onEntryModified={silentRefreshEntries}
          onLanguageBadgeClick={handleLanguageBadgeClick}
          customNavigate={customNavigate}
        />
      )}

      {isLoading && (
        <HistoryList
          entries={[]}
          selectedEntries={new Set()}
          setSelectedEntries={setSelectedEntries}
          searchQuery={""}
          isLoading={true}
          onEntryRemoved={() => {}}
          onEntryModified={() => {}}
          onLanguageBadgeClick={() => {}}
          customNavigate={() => {}}
        />
      )}
    </div>
  );
}
