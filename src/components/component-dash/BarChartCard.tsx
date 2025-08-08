import { Card, CardContent, Typography, Box } from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts"

interface BarChartData {
  name: string
  series1: number
  series2: number
}

interface BarChartCardProps {
  title: string
  data: BarChartData[]
  xAxisLabel: string
}

export default function BarChartCard({ title, data, xAxisLabel }: BarChartCardProps) {
  return (
    <Card sx={{ height: "649px", width: "654px", boxShadow: 3, borderRadius: "38.38px" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography sx={{ mb: 1, fontFamily: "Poppins, sans-serif", fontSize: "16px", fontWeight: 500 }}>
          {title}
        </Typography>

        <Box sx={{ height: 570 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              barSize={50}
              margin={{ right: 30, bottom: 5, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14, fill: "#000", fontFamily: "Poppins, sans-serif" }}
                width={80}
              />
              <Bar dataKey="series1" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? '#438FF9' : '#00FFD7'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}
