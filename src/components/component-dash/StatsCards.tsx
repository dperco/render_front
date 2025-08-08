import { Card, CardContent, Box, Typography, Avatar } from "@mui/material"
import type { SvgIconComponent } from "@mui/icons-material"

interface StatsCardProps {
    icon: SvgIconComponent
    value: string
    label: string
}

export default function StatsCard({ icon: Icon, value, label }: StatsCardProps) {
    return (
        <Card
            sx={{
                width: 317,
                height: 120,
                background: 'linear-gradient(135deg, #23FFDC17 0%, #BDE0FF 100%)',
                border: '1px solid #0087FF',
                borderRadius: '20px',
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            <CardContent sx={{ pt: "20px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <Avatar
                        sx={{
                            bgcolor: "white",
                            color: "#000",
                            width: 60,
                            height: 60,
                        }}
                    >
                        <Icon fontSize="small" sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Box>
                        <Typography
                            variant="h4"
                            component="div"
                            sx={{
                                fontWeight: "semi-bold",
                                color: "#000",
                                fontSize: "32px",
                                fontFamily: "Poppins, sans-serif",
                                mb: 0.5,
                            }}
                        >
                            {value}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#000",
                                fontSize: "16px",
                                fontFamily: "Poppins, sans-serif",
                            }}
                        >
                            {label}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}
