"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import Navbar from "@/components/navbar/pages";
import VacanciesTable from "@/components/component-vacancies/VacanciesTable/VacanciesTable";
import VacanciesCards from "@/components/component-vacancies/CardVacancie/CardVacancie";
import SearchCardToggle from "@/components/SearchCard/SearchActionsBar";
import CarouselVacancie from "@/components/component-vacancies/CarouselVacancies/CarouselVacancies";
import { fetchVacancies } from "@/services/api";

export default function VacanciesPageClient({ vacanciesProp }: any) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [vacancies, setVacancies] = useState(vacanciesProp);

  const handleAddSuccess = async () => {
    const resultVacancies = await fetchVacancies();
    setVacancies(resultVacancies);
  };

  return (
    <>
      <Box>
        <Navbar />
      </Box>
      <Box
        sx={{
          marginLeft: "60px",
          marginRight: "60px",
        }}
      >
        <Box
          sx={{ mb: 2, fontSize: "1.25rem", color: "#000"}}
        >
          Vacantes
        </Box>

        <Box sx={{ mb: 3 }}>
          <SearchCardToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            setSearchTerm={setSearchTerm}
            currentSection="vacante"
            onAddClick={() => {}}
            onAddSuccess={handleAddSuccess}
          />
        </Box>
        {/* <Box>
          <CarouselVacancie vacanciesProp={vacancies} />
        </Box> */}
        <Box>
          {viewMode === "cards" ? (
            <VacanciesCards vacanciesProp={vacancies} searchTerm={searchTerm} />
          ) : (
            <VacanciesTable vacanciesProp={vacancies} searchTerm={searchTerm} />
          )}
        </Box>
      </Box>
    </>
  );
}
