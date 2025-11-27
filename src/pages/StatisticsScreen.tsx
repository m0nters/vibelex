import { BackButton } from "@/components";
import { getLanguageStatistics, LanguageStats } from "@/services";
import { getColorForIndex } from "@/utils";
import { ChartPie, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface LanguageData {
  [key: string]: string | number;
  name: string;
  value: number;
  percentage: string;
  code: string;
}

type TabType = "source" | "target";

export function StatisticsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // restore previous active tab
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

  // Restore previous states and free them up
  useEffect(() => {
    // scroll position
    const savedScrollPosition = sessionStorage.getItem(
      "statisticsScreenScrollPosition",
    );
    if (savedScrollPosition && scrollContainerRef.current) {
      const scrollTop = parseInt(savedScrollPosition, 10);
      // Use setTimeout to ensure the DOM is fully rendered
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollTop;
        }
      }, 100);
      // Clear the saved position after restoring
      sessionStorage.removeItem("statisticsScreenScrollPosition");
    }

    // active tab
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

      // Convert to chart data format with language names from i18n
      const sourceData = statisticsData.sourceLanguages.map(
        (lang: LanguageStats) => ({
          code: lang.languageCode,
          name: t(
            `languages:${lang.languageCode}`,
            lang.languageCode.toUpperCase(),
          ),
          value: lang.count,
          percentage: lang.percentage.toFixed(1),
        }),
      );

      const targetData = statisticsData.targetLanguages.map(
        (lang: LanguageStats) => ({
          code: lang.languageCode,
          name: t(
            `languages:${lang.languageCode}`,
            lang.languageCode.toUpperCase(),
          ),
          value: lang.count,
          percentage: lang.percentage.toFixed(1),
        }),
      );

      setSourceLanguageData(sourceData);
      setTargetLanguageData(targetData);
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

  const savePreviousStates = () => {
    sessionStorage.setItem("activeTab", activeTab);
    if (scrollContainerRef.current) {
      sessionStorage.setItem(
        "statisticsScreenScrollPosition",
        scrollContainerRef.current.scrollTop.toString(),
      );
    }
  };

  const customNavigate = (path: string, options?: any) => {
    savePreviousStates();
    navigate(path, options);
  };

  const handleLanguageClick = (languageCode: string) => {
    const searchQuery = `${activeTab}:${languageCode}`;
    customNavigate("/history", {
      state: { searchQueryForStatistics: searchQuery, fromStatistics: true },
    });
  };

  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percentage } = props;

    // Only show label if percentage is >= 5%
    if (parseFloat(percentage) < 5) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div
      ref={scrollContainerRef}
      className="animate-slide-in-right h-full w-full overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 select-none"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-indigo-100 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <BackButton />
            <div className="flex items-center space-x-2">
              <ChartPie className="h-5 w-5 text-indigo-600" />
              <h1 className="text-lg font-semibold text-gray-800">
                {t("statistics:title")}
              </h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200 bg-white/50">
          <button
            onClick={() => setActiveTab("source")}
            className={`flex-1 cursor-pointer border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "source"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {t("statistics:sourceLanguages")}
          </button>
          <button
            onClick={() => setActiveTab("target")}
            className={`flex-1 cursor-pointer border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "target"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {t("statistics:targetLanguages")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="text-gray-500">
                {t("statistics:loadingStatistics")}...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Card */}
            <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm select-text">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("statistics:totalTranslations")}
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {totalEntries.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t(
                      activeTab === "source"
                        ? "statistics:sourceLanguages"
                        : "statistics:targetLanguages",
                    )}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {currentData.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={currentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => renderCustomLabel(props)}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {currentData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getColorForIndex(index, currentData.length)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as LanguageData;
                        return (
                          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                            <p className="text-sm font-semibold text-gray-800">
                              {data.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {t("statistics:count")}:{" "}
                              <span className="text-sm font-medium">
                                {data.value}
                              </span>
                            </p>
                            <p className="text-xs text-gray-600">
                              {t("statistics:percentage")}:{" "}
                              <span className="text-sm font-medium">
                                {data.percentage}%
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-2 border-t border-gray-100 pt-4 select-text">
                {currentData.map((item, index) => (
                  <div
                    key={`legend-${index}`}
                    className="flex items-center space-x-1"
                    title={`${item.name}: ${item.percentage}%`}
                  >
                    <div
                      className="h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: getColorForIndex(
                          index,
                          currentData.length,
                        ),
                      }}
                    />
                    <span className="text-xs text-gray-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed List */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-800">
                  {t("statistics:detailedBreakdown")}
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {currentData.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleLanguageClick(item.code)}
                    className="group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-indigo-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-4 w-4 shrink-0 rounded-sm"
                        style={{
                          backgroundColor: getColorForIndex(
                            index,
                            currentData.length,
                          ),
                        }}
                      />
                      <span
                        className="max-w-16 truncate font-medium text-gray-800"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center space-x-4 transition-all group-hover:space-x-6">
                      <span
                        className="max-w-24 truncate text-sm text-gray-600"
                        title={t("statistics:translations", {
                          count: item.value,
                        })}
                      >
                        {t("statistics:translations", { count: item.value })}
                      </span>
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                        {item.percentage}%
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400 transition-colors group-hover:text-indigo-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
