import { Card, CardContent, Typography, Box, Button, Chip } from "@mui/material"
import { KeyboardArrowDown, TrendingUp, CalendarMonth } from "@mui/icons-material"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"

interface LineChartSectionProps {
   title: string
  data: Array<{ name: string; value: number }>
}

export default function LineChartSection({ title,data }: LineChartSectionProps) {
  return (
    <Card sx={{ height: "293px", borderRadius: "20px", width: "654px" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 500, fontSize: "16px", fontFamily: "Poppins, sans-serif" }}>
            {title}
          </Typography>
          <Button
            variant="contained"
            startIcon={<CalendarMonth
              sx={{
                fontSize: 10,            
                "& .MuiSvgIcon-root": {
                  fontSize: 10,           
                },
              }}
            />}
            endIcon={<KeyboardArrowDown sx={{ fontSize: "12px" }} />}
            sx={{
              padding: "9px",
              bgcolor: "#002338",
              color: "white",
              textTransform: "none",
              borderRadius: "4px",
              fontSize: "10px",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Junio 2025
          </Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Typography variant="h3" component="div" sx={{ fontWeight: 600, color: "#2196F3", fontSize: "24px" , fontFamily: "Poppins, sans-serif" }}>
            10
          </Typography>
          <Chip
            icon={<TrendingUp sx={{ fontSize: 16 }} />}
            label="16.8%"
            size="small"
            sx={{
              bgcolor: "#05c1692d",
              color: "#14CA74",
              fontWeight: "bold",
              borderRadius: "2px",
              "& .MuiChip-icon": {
                color: "#14CA74",
              },
            }}
          />
        </Box>

        <Box sx={{ height: 150 }}>
          <ResponsiveContainer >
            <AreaChart data={data} margin={{ top: 5, right: 0, left: -40, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
              <Area type="monotone" dataKey="value" stroke="#2196F3" strokeWidth={2} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}
