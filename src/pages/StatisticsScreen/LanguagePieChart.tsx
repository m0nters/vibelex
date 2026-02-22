import { LanguageData } from "@/types";
import { getColorForIndex } from "@/utils";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

function CustomLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percentage } = props;

  if (parseFloat(percentage) < 5) return null;

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
}

function CustomTooltip({ active, payload }: any) {
  const { t } = useTranslation();

  if (!active || !payload?.length) return null;

  const data = payload[0].payload as LanguageData;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="text-sm font-semibold text-gray-800">{data.name}</p>
      <p className="text-xs text-gray-600">
        {t("statistics:count")}:{" "}
        <span className="text-sm font-medium">{data.value}</span>
      </p>
      <p className="text-xs text-gray-600">
        {t("statistics:percentage")}:{" "}
        <span className="text-sm font-medium">{data.percentage}%</span>
      </p>
    </div>
  );
}

interface LanguagePieChartProps {
  data: LanguageData[];
}

export function LanguagePieChart({ data }: LanguagePieChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props) => <CustomLabel {...props} />}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1000}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColorForIndex(index, data.length)}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 border-t border-gray-100 pt-4 select-text">
        {data.map((item, index) => (
          <div
            key={`legend-${index}`}
            className="flex items-center space-x-1"
            title={`${item.name}: ${item.percentage}%`}
          >
            <div
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: getColorForIndex(index, data.length) }}
            />
            <span className="text-xs text-gray-700">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
