import { getLanguageStatistics, LanguageStats } from "@/services";
import { LanguageData, TabType } from "@/types";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LanguageDetailList } from "./LanguageDetailList";
import { LanguagePieChart } from "./LanguagePieChart";
import { StatisticsHeader } from "./StatisticsHeader";
import { StatsSummaryCard } from "./StatsSummaryCard";

export function StatisticsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const previousActiveTab = sessionStorage.getItem(
    "activeTab",
  ) as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(
    previousActiveTab || "source",
  );
  const [sourceLanguageData, setSourceLanguageData] = useState<LanguageData[]>(
    [],
  );
  const [targetLanguageData, setTargetLanguageData] = useState<LanguageData[]>(
    [],
  );
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatisticsData();
  }, []);

  // Restore scroll position and active tab from session, then clear them
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(
      "statisticsScreenScrollPosition",
    );
    if (savedScrollPosition && scrollContainerRef.current) {
      const scrollTop = parseInt(savedScrollPosition, 10);
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollTop;
        }
      }, 100);
      sessionStorage.removeItem("statisticsScreenScrollPosition");
    }
    sessionStorage.removeItem("activeTab");
  }, []);

  const loadStatisticsData = async () => {
    try {
      setLoading(true);
      const statisticsData = await getLanguageStatistics();
      setTotalEntries(statisticsData.totalEntries);

      if (statisticsData.totalEntries === 0) {
        setSourceLanguageData([]);
        setTargetLanguageData([]);
        return;
      }

      const mapLang = (lang: LanguageStats): LanguageData => ({
        code: lang.languageCode,
        name: t(
          `languages:${lang.languageCode}`,
          lang.languageCode.toUpperCase(),
        ),
        value: lang.count,
        percentage: lang.percentage.toFixed(1),
      });

      setSourceLanguageData(statisticsData.sourceLanguages.map(mapLang));
      setTargetLanguageData(statisticsData.targetLanguages.map(mapLang));
    } catch (error) {
      console.error("Failed to load statistics data:", error);
      setSourceLanguageData([]);
      setTargetLanguageData([]);
    } finally {
      setLoading(false);
    }
  };

  const currentData =
    activeTab === "source" ? sourceLanguageData : targetLanguageData;

  const handleLanguageClick = (languageCode: string) => {
    sessionStorage.setItem("activeTab", activeTab);
    if (scrollContainerRef.current) {
      sessionStorage.setItem(
        "statisticsScreenScrollPosition",
        scrollContainerRef.current.scrollTop.toString(),
      );
    }
    navigate("/history", {
      state: {
        searchQueryForStatistics: `${activeTab}:${languageCode}`,
        fromStatistics: true,
      },
    });
  };

  return (
    <div
      ref={scrollContainerRef}
      className="animate-slide-in-right h-full w-full overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 select-none"
    >
      <StatisticsHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              <p className="text-gray-500">
                {t("statistics:loadingStatistics")}...
              </p>
            </div>
          </div>
        ) : (
          <>
            <StatsSummaryCard
              totalEntries={totalEntries}
              activeTab={activeTab}
              languageCount={currentData.length}
            />
            <LanguagePieChart data={currentData} />
            <LanguageDetailList
              data={currentData}
              onLanguageClick={handleLanguageClick}
            />
          </>
        )}
      </div>
    </div>
  );
}
