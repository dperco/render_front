"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Employee, CardProps } from "@/types/interface";
import { Box, Grid2, Typography, Button, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
interface Props {
  searchTerm: string;
  collaboratorProp: Employee[];
}
export default function CardsEmployes({
  searchTerm,
  collaboratorProp,
}: Props) {
  const [filteredEmployee, setFilteredEmployee] = useState<Employee[]>([]);
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const router = useRouter();
  useEffect(() => {
    const empleadosTransformados = collaboratorProp.map((item) => ({
      ...item,
      first_nameS: item.first_name,
      last_nameS: item.last_name,
      first_name: item.first_name?.split(" ")[0] || "",
      last_name: item.last_name?.split(" ")[0] || "",
    }));
    const term = (searchTerm ?? "").trim().toLowerCase();

    if (!term) {
      setFilteredEmployee(empleadosTransformados);
      return;
    }
     const result = empleadosTransformados.filter((v) => {
      const byVacName = (v.first_nameS ?? "").toLowerCase().includes(term);
      const bySeniority = (v.roles[0]?.rol ?? "").toLowerCase().includes(term);
      const byProyectos = (v.Proyectos[0]?.projectId?.name ?? "").toLowerCase().includes(term);
      const byDni = (v.dni !== undefined && v.dni !== null ? String(v.dni) : "").toLowerCase().includes(term);
      return byVacName || bySeniority || byProyectos || byDni;
    });
    setFilteredEmployee(result);
  }, [collaboratorProp, searchTerm]);

  const handleMouseEnter = (index: number) => {
    setHoveredButton(index);
  };
  const handleMouseLeave: () => void = () => {
    setHoveredButton(null);
  };
  return (
    <Box display="flex" justifyContent="center" mt={2}>
      <Grid2 container spacing={3} justifyContent="space-between" >
        {filteredEmployee.map((empleado, index) => (
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
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.493)",

              transition: "all 0.3s ease",
            }}
          >
            {hoveredButton === index ? (
              <Grid2
                sx={{
                  marginTop: "40px",
                  marginLeft: "40px",
                  marginRight: "40px",
                }}
              >
                <Box>
                  <Typography
                    textAlign="center"
                    sx={{
                      fontSize: "24px",
                      fontFamily: "Poppins",
                      height: "60px",
                      fontWeight: 500,
                      color: "#FFFFFF",
                    }}
                  >
                    {`${empleado.last_name} ${empleado.first_name} `}
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
                    {empleado.roles && empleado.roles.length > 0
                      ? empleado.roles.map((r) => r.rol).join(" / ")
                      : ""}
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
                    Proyectos:
                  </Typography>
                  <Box sx={{ height: "104px" }}>
                    {Array.isArray(empleado.Proyectos) && empleado.Proyectos.length > 0 ? (
                      empleado.Proyectos
                        .filter(p => p.projectId && typeof p.projectId !== 'string')
                        .map((p, idx) => {
                          if (p.projectId) {
                            const { id, name } = p.projectId;
                            return (
                              <Typography
                                key={id}
                                sx={{
                                  fontSize: "18px",
                                  fontFamily: "Poppins",
                                  fontWeight: 500,
                                  color: "#FFFFFF",
                                  textAlign: "center",
                                }}
                              >
                                • {name}
                              </Typography>
                            );
                          }
                        })
                    ) : (
                      <Typography
                        sx={{
                          fontSize: "18px",
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          color: "#FFFFFF",
                          textAlign: "center",
                        }}
                      >
                        No hay proyectos asignados
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{
                    position: "absolute",
                    bottom: "90px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "80%",
                  }}> <Typography
                    sx={{
                      fontSize: "18px",
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      color: "#FFFFFF",
                      textAlign: "center",
                      marginTop: "20px",
                    }}
                  >
                      Tiempo asignado: {`${empleado.horasAsignadas || 0}hs`}
                    </Typography></Box>

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
                      marginTop: "20px",
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
                    onClick={() =>
                      router.push(
                        `/pages/detail/collaborator_detail/${empleado.id}`
                      )
                    }
                  >
                    <Typography
                      sx={{
                        Size: "20px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        textAlign: "center",
                        color: "#002338",
                        lineHeight: "100%",
                      }}
                    >
                      Ver Perfil
                    </Typography>
                  </Button>
                </Box>
              </Grid2>
            ) : (
              <>
                <Box className="profile-pic">
                  <Image
                    src={empleado.image ? empleado.image : "/images/anonimo.jpeg"}
                    alt={`${empleado.last_name}${empleado.first_name}`}
                    layout="fill"
                    objectFit="cover"
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    height: "88.92px",
                    bgcolor: "#002338",
                    p: "14px 20px",
                    color: "white",
                    textAlign: "center",
                    transition: "all 2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <Typography variant="h6">
                    {empleado.last_name} {empleado.first_name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="#23FFDC"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      fontSize: "20px",
                      fontFamily: "Poppins",
                      fontWeight: 500,
                    }}
                  >
                    {empleado.roles?.[0]?.rol || ""}
                    {empleado.roles && empleado.roles.length > 1 && (
                      <Tooltip
                        title={
                          <Box>
                            {empleado.roles.slice(1).map((r, i) => (
                              <div key={i}>
                                Rol adicional: {r.rol} - {r.seniority}
                              </div>
                            ))}
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        <span
                          style={{
                            background: "#0087FF",
                            color: "#fff",
                            borderRadius: "50%",
                            padding: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            marginLeft: "4px",
                            display: "inline-block",
                          }}
                        >
                          +{empleado.roles.length - 1}
                        </span>
                      </Tooltip>
                    )}
                  </Typography>
                </Box>
              </>
            )}
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}
