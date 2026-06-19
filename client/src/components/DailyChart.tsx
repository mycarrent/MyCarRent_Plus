/**
 * DailyChart — Stacked bar chart using Recharts
 * Shows expense breakdown by category (wash, delivery, pickup, other)
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatDateShort, formatPriceFull } from "@/lib/utils-app";

interface DayData {
  date: string;
  total: number;
  wash: number;
  delivery: number;
  pickup: number;
  other?: number;
}

interface Props {
  data: DayData[];
}

const LABEL_MAP: Record<string, string> = {
  wash: "ล้างรถ",
  delivery: "ส่งรถ",
  pickup: "เก็บรถ",
  other: "อื่นๆ",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl p-3 text-xs shadow-lg border border-gray-100">
      <p className="font-semibold mb-1">{formatDateShort(label)}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: p.fill }}
          />
          <span>{LABEL_MAP[p.dataKey] || p.dataKey}</span>
          <span className="num-display ml-auto">{formatPriceFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function DailyChart({ data }: Props) {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 80)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          tick={{ fontSize: 11, fontFamily: "Kanit" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fontFamily: "Roboto Mono" }}
          axisLine={false}
          tickLine={false}
          width={45}
          tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="wash" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
        <Bar dataKey="delivery" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
        <Bar dataKey="pickup" stackId="a" fill="#F97316" radius={[0, 0, 0, 0]} />
        <Bar dataKey="other" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
