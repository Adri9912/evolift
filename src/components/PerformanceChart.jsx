import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { number } from "../utils/format.js";
export default function PerformanceChart({ points, metric, label, unit }) {
  return (
    <div
      className="chart-wrap"
      role="img"
      aria-label={`${label} : ${points.map((p) => `${p.fullDate}, ${number(p[metric])} ${unit}`).join(" ; ")}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={points}
          margin={{ top: 24, right: 18, left: 0, bottom: 12 }}
          accessibilityLayer
        >
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--muted)"
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            minTickGap={25}
          />
          <YAxis
            stroke="var(--muted)"
            tickLine={false}
            axisLine={false}
            width={48}
            allowDecimals={metric === "weight" || metric === "volume"}
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text)",
            }}
            labelFormatter={(_, payload) => payload?.[0]?.payload.fullDate}
            formatter={(value) => [`${number(value)} ${unit}`, label]}
          />
          <Line
            type="linear"
            dataKey={metric}
            name={label}
            stroke="var(--chart)"
            strokeWidth={3}
            dot={{ r: 5, fill: "var(--surface)", strokeWidth: 3 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
