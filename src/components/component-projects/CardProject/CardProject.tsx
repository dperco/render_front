"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectNew, Employee } from "@/types/interface";
import { Box, Grid2, Typography, Button } from "@mui/material";

export default function CardsProjects({
  searchTerm,
  projectsProp,
  collaboratorProp,
}: {
  searchTerm: string;
  projectsProp: any;
  collaboratorProp: any;
}) {
  const [filteredProjects, setFilteredProjects] =
    useState<ProjectNew[]>(projectsProp);

  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const term = (searchTerm ?? "").trim().toLowerCase();

    if (!term) {
      setFilteredProjects(projectsProp);
      return;
    }

    const filter = projectsProp.filter((proyecto: any) => {
      const name = proyecto.name || "";
      const normalizedProjectName = name.trim().toLowerCase();
      return normalizedProjectName.includes(searchTerm.toLowerCase());
    });
    setFilteredProjects(filter);
  }, [searchTerm, projectsProp]);

  // useEffect(() => {
  //   const colaboradoresPorProyecto: { [key: string]: Employee[] } = {};
  //   collaboratorProp.forEach((colaborador: Employee) => {
  //     if (colaborador.Proyectos && Array.isArray(colaborador.Proyectos)) {
  //       const proyectosNombres: string[] = colaborador.Proyectos.filter(
  //         (proyecto: any) => proyecto && proyecto.vacancieName
  //       ).map((proyecto: any) =>
  //         (proyecto.vacancieName || "").trim().toLowerCase()
  //       );
  //       proyectosNombres.forEach((proyectoNombre) => {
  //         if (!colaboradoresPorProyecto[proyectoNombre]) {
  //           colaboradoresPorProyecto[proyectoNombre] = [];
  //         }
  //         colaboradoresPorProyecto[proyectoNombre].push(colaborador);
  //       });
  //     } else {
  //       console.warn(
  //         `El colaborador ${colaborador.first_name} ${colaborador.last_name} no tiene proyectos asignados.`
  //       );
  //     }
  //   });

  //   setEmpleadosPorProyecto(colaboradoresPorProyecto);
  // }, [collaboratorProp]);

  const handleMouseEnter = (index: number) => {
    setHoveredButton(index);
  };

  const handleMouseLeave: () => void = () => {
    setHoveredButton(null);
  };

  return (
    <Box display="flex" justifyContent="center" mt={2}>
      <Grid2 container spacing={3} justifyContent="space-between">
        {filteredProjects.map((proyecto, index) => {
          return (
            <Grid2
              key={index}
              justifyContent="center"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              sx={{
                width: "310px",
                height: "417px",
                bgcolor: "#002338",
                borderRadius: "29px",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.1s ease",
                border: "1px solid #CDCDCD",
                boxShadow:
                  hoveredButton === index
                    ? "0px 8px 16px rgba(0, 0, 0, 0.4)"
                    : "none",
              }}
            >
              {hoveredButton === index ? (
                <Grid2
                  sx={{
                    marginTop: "40px",
                  }}
                >
                  <Box sx={{ marginTop: "65px" }}>
                    <Typography
                      textAlign="center"
                      alignItems="center"
                      sx={{
                        fontSize: "24px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: "#FFFFFF",
                      }}
                    >
                      {proyecto.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "20px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: "#23FFDC",
                        textAlign: "center",
                      }}
                    >
                      {proyecto.client}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: "#FFFFFF",
                        textAlign: "center",
                        marginTop: "20px",
                      }}
                    >
                      Manager: {proyecto.managerName}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: "#FFFFFF",
                        textAlign: "center",
                        marginTop: "20px",
                      }}
                    >
                      Cantidad de empleados asignados:{" "}
                      {proyecto.assignedPersons
                        ? proyecto.assignedPersons.length
                        : 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "80%",
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: "#0087FF",
                        borderRadius: "20px",
                        width: "100%",
                        height: "50px",
                        textTransform: "none",
                        "&:hover": {
                          bgcolor: "#23FFDC",
                        },
                        "&:active": {
                          bgcolor: "#23FFDC",
                        },
                      }}
                      onClick={() => {
                        router.push(
                          `/pages/detail/project_detail/${proyecto.id}`
                        );
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "20px",
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          textAlign: "center",
                          color: "#002338",
                          lineHeight: "100%",
                        }}
                      >
                        Ver más
                      </Typography>
                    </Button>
                  </Box>
                </Grid2>
              ) : (
                <>
                  <Box
                    sx={{
                      bgcolor: "#fff",
                      position: "relative",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <img
                      src={proyecto.image || "/images/Logo.svg"}
                      alt={proyecto.name || ""}
                      // layout="fill"
                      // objectFit="scale-down"
                    />
                  </Box>

                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      width: "100%",
                      height: "88.92px",
                      bgcolor: "#fff",
                      p: "14px 20px",
                      color: "#002338",
                      alignItems: "center",
                      textAlign: "left",
                      transition: "all 2s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0px -4px 4px rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    <Typography variant="h6">{proyecto.name}</Typography>
                  </Box>
                </>
              )}
            </Grid2>
          );
        })}
      </Grid2>
    </Box>
  );
}
