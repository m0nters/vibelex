import { useDebounce } from "@/hooks";
import {
  getDisplayText,
  getHistoryEntryStatistics,
  searchHistory,
} from "@/services";
import { HistoryEntry } from "@/types";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      ref={scrollContainerRef}
      className="animate-slide-in-right h-full w-full overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 select-none"
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
        onDeleted={() => {
          setSelectedEntries(new Set());
          displayResultedEntry();
        }}
        onBeforeAction={saveScrollPosition}
      />

      {!isLoading && (
        <HistoryList
          entries={sortedEntries}
          selectedEntries={selectedEntries}
          setSelectedEntries={setSelectedEntries}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onBeforeAction={saveScrollPosition}
          onEntryModified={displayResultedEntry}
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
          onBeforeAction={() => {}}
          onEntryModified={() => {}}
          onLanguageBadgeClick={() => {}}
          customNavigate={() => {}}
        />
      )}
    </div>
  );
}
