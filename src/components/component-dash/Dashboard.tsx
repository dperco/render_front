import { Container, Grid, Box } from "@mui/material"
import StatsCard from "./StatsCards"
import LineChartSection from "./LineChartSection"
import DonutChartCard from "./DonutChartCard"
import BarChartCard from "./BarChartCard"
import { People, Work, Language, Psychology } from "@mui/icons-material"

type Metrics = {
    metricasClave: {
        totalColaboradores: number
        proyectosActivos: number
        vacantesActivas: number
        totalTecnologias: number
    }
    contratacionesMensuales: {
        titulo: string
        datos: Array<{ mes: string; nuevasContrataciones: number }>
    }
    estadoDeProyectos: {
        total: number
        porEstado: Record<"Ejecución" | "Terminado", number>
    }
    estadoDeAsignacion: {
        total: number
        porEstado: Record<string, number>
    }
    tecnologiasTop: Array<{ nombre: string; cantidad: number }>;
    personasPorProyecto: Array<{ nombre: string; cantidad: number }>;
}

export default function Dash({ metricsProp }: { metricsProp: Metrics }) {
    const {
        metricasClave,
        contratacionesMensuales,
        estadoDeProyectos,
        estadoDeAsignacion,
        tecnologiasTop,
        personasPorProyecto
    } = metricsProp

    const statsData = [
        {
            icon: People,
            value: String(metricasClave.totalColaboradores),
            label: "Total de colaboradores",
        },
        {
            icon: Work,
            value: String(metricasClave.proyectosActivos),
            label: "Proyectos activos",
        },
        {
            icon: Language,
            value: String(metricasClave.vacantesActivas),
            label: "Vacantes activas",
        },
        {
            icon: Psychology,
            value: String(metricasClave.totalTecnologias),
            label: "Tecnologías registradas",
        },
    ]

    const lineData = contratacionesMensuales.datos.map((d) => ({
        name: d.mes,
        value: d.nuevasContrataciones,
    }))

    const projectStatus = Object.entries(estadoDeProyectos.porEstado).map(
        ([name, value]) => ({
            name,
            value,
            color: name === "Ejecución" ? "#00BCD4" : "#2196F3",
        })
    )

    const collaboratorStatus = Object.entries(estadoDeAsignacion.porEstado).map(
        ([name, value]) => ({
            name,
            value,
            color:
                name === "Sobreasignación"
                    ? "#FF5722"
                    : name === "Sin asignación"
                        ? "#00BCD4"
                        : "#2196F3",
        })
    )

    const techData = tecnologiasTop.map((t) => ({
        name: t.nombre,
        series1: t.cantidad,
        series2: 0,
    }))
    const peoplePerProjectData = personasPorProyecto.map(p => ({ name: p.nombre, series1: p.cantidad, series2: 0 }));

    return (
        <Box sx={{
            alignItems: "center",
            justifyContent: "center",
            py: 4
        }}>
            <Box
                sx={{
                    width: "100%",
                    px: { xs: 2, sm: 8, md: 8, lg: 16, xl: 10 }, 
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                    {statsData.map((stat, idx) => (
                        <Grid item key={idx} xs={12} sm={6} md={3}>
                            <StatsCard {...stat} />
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} lg={6}>
                        <LineChartSection
                            title={contratacionesMensuales.titulo}
                            data={lineData}
                        />
                    </Grid>
                    <Grid item xs={12} lg={3}>
                        <DonutChartCard
                            title="Estado de proyectos"
                            data={projectStatus}
                            total={estadoDeProyectos.total}
                        />
                    </Grid>
                    <Grid item xs={12} lg={3}>
                        <DonutChartCard
                            title="Estado de colaboradores"
                            data={collaboratorStatus}
                            total={estadoDeAsignacion.total}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid item xs={12} lg={6}>
                        <BarChartCard
                            title="Tecnologías"
                            data={techData}
                            xAxisLabel="Colaboradores"
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <BarChartCard
                            title="Proyectos"
                            data={peoplePerProjectData}
                            xAxisLabel="Colaboradores"
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}
