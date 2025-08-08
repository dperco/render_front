"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Grid2 } from "@mui/material";
import { Vacante } from "@/types/interface";
import { useRouter } from "next/navigation";

interface Props {
  searchTerm: string;
  vacanciesProp: any[];
}

export default function CardsVacantes({ searchTerm, vacanciesProp }: Props) {
  const router = useRouter();

  const [filteredVacancies, setFilteredVacancies] =
    useState<any[]>(vacanciesProp);

  useEffect(() => {
    const term = (searchTerm ?? "").trim().toLowerCase();

    if (!term) {
      setFilteredVacancies(vacanciesProp);
      return;
    }

    const result = vacanciesProp.filter((v) => {
      const byVacName = (v.vacancieName ?? "").toLowerCase().includes(term);
      const bySeniority = (v.seniority ?? "").toLowerCase().includes(term);
      return byVacName || bySeniority;
    });
    

    setFilteredVacancies(result);
  }, [searchTerm, vacanciesProp]);

  return (
    <>
      <Box display="flex" justifyContent="center" mt={2}>
        {/* <Box sx={{ maxHeight: 700, px: 2, width: "100%" }}> */}
          <Grid2
            container
            spacing={3}
            justifyContent="space-between"
            columns={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
          >
            {filteredVacancies.map((vacante, idx) => (
              <Grid2
                key={idx}
                sx={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                display="flex"
                justifyContent="center"
              >
                <Grid2
                  container
                  direction="column"
                  justifyContent="space-between"
                  sx={{
                    width: "310px",
                    height: "336px",
                    bgcolor: "#002338",
                    borderRadius: "20px",
                    color: "#fff",
                    boxShadow: 6,
                  }}
                >
                  <Grid2
                    sx={{
                      marginTop: "30px",
                      marginBottom: "30px",
                      marginLeft: "27.5px",
                      marginRight: "27.5px",
                    }}
                  >
                    <Typography
                      textAlign="center"
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: "#23FFDC",
                        fontSize: "20px",
                        width: "255px",
                        height: "36px",
                      }}
                    >
                      {vacante.vacancieName}
                    </Typography>
                    <Typography
                      textAlign="center"
                      mt={"30px"}
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "18px",
                        width: "255px",
                        height: "60px",
                      }}
                    >
                      Proyecto: {vacante.projectId?.name || "No asignado"}
                    </Typography>
                    <Typography
                      textAlign="center"
                      mt={"10px"}
                      sx={{
                        fontSize: "18px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                      }}
                    >
                      Horas requeridas: {vacante.time}
                    </Typography>
                    <Typography
                      textAlign="center"
                      mt={"10px"}
                      sx={{
                        fontSize: "18px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                      }}
                    >
                      Seniority: {vacante.seniority}
                    </Typography>

                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: "#0087FF",
                        borderRadius: "20px",
                        color: "#000",
                        marginTop: "30px",
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
                          `/pages/detail/VacanciesDetail/${vacante.id}`
                        );
                      }}
                    >
                      <Typography
                        textAlign="center"
                        sx={{
                          fontSize: "20px",
                          color: "#002338",
                          fontFamily: "Poppins",
                          fontWeight: 500,
                        }}
                      >
                        Ver más
                      </Typography>
                    </Button>
                  </Grid2>
                </Grid2>
              </Grid2>
            ))}
          </Grid2>
        </Box>
      {/* </Box> */}
    </>
  );
}
