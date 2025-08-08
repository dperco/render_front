import { Card, CardContent, Typography, Box } from "@mui/material"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface DonutChartData {
    name: string
    value: number
    color: string
}

interface DonutChartCardProps {
    title: string
    data: DonutChartData[]
    total: number
}

export default function DonutChartCard({ title, data, total }: DonutChartCardProps) {
    return (
        <Card sx={{ height: "294px", borderRadius: "20px", width: "317px" }}>
            <CardContent sx={{ p: "16px" }}>
                <Typography variant="h6" component="div" sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "16px" }}>
                    {title}
                </Typography>

                <Box sx={{ position: "relative", height: 173 }}>
                    <ResponsiveContainer >
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={68} outerRadius={80} dataKey="value">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="body2" sx={{ fontSize: "14px", fontWeight: 500, color: "#949596", fontFamily: "Poppins" }}>
                            Total
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 600, fontSize: "32px", color: "#000", fontFamily: "Poppins" }}>
                            {total}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "6px",
                    }}
                >
                    {data.map((item, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "2px",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    bgcolor: item.color,
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "#585757",
                                    fontFamily: "Poppins",
                                }}
                            >
                                {item.name} ({item.value})
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    )
}
