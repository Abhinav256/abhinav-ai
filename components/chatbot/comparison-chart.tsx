"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface ComparisonData {
  companies: string[]
  metrics: Array<{
    name: string
    [key: string]: string | number
  }>
}

const COLORS = ["#6366f1", "#06b6d4", "#10b981"]

export function ComparisonChart({ data }: { data: ComparisonData }) {
  return (
    <div className="bg-muted/20 rounded-lg p-3">
      <h4 className="text-foreground font-medium text-sm mb-3">Company Comparison</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.metrics} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="#888" fontSize={10} />
            <YAxis dataKey="name" type="category" stroke="#888" fontSize={10} width={70} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(30, 41, 82, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            {data.companies.map((company, index) => (
              <Bar
                key={company}
                dataKey={company}
                fill={COLORS[index % COLORS.length]}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
