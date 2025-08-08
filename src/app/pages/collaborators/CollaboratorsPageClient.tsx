"use client";
import React, { useState } from "react";
import Navbar from "@/components/navbar/pages";
import EmployeeTable from "@/components/components-collaborators/TableEmployes/TableEmployes";
import CardsEmployes from "@/components/components-collaborators/cards-employes/CardEmployes";
import SearchCardToggle from "@/components/SearchCard/SearchActionsBar";
import { Box } from "@mui/material";
import { fetchCollaborators } from "@/services/api";
export default function Home({ collaboratorsProp, columnsProp }: any) {
  const [collaborators, setCollaborators] = useState(collaboratorsProp);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const handleAddSuccess = async () => {
    const resultCollaborators = await fetchCollaborators();
    setCollaborators(resultCollaborators);
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
        <Box sx={{ mb: 2, fontSize: "24px", color: "#000" }}>Colaboradores</Box>
        <Box sx={{ mb: 3 }}>
          <SearchCardToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            setSearchTerm={setSearchTerm}
            currentSection="colaboradores"
            onAddSuccess={handleAddSuccess}
            onAddClick={() => {}}
          />
        </Box>
        <Box>
          {viewMode === "cards" ? (
            <CardsEmployes
              collaboratorProp={collaborators}
              searchTerm={searchTerm}
            />
          ) : (
            <EmployeeTable
              collaboratorProp={collaborators}
              searchTerm={searchTerm}
              columnsprop={columnsProp}
            />
          )}
        </Box>
      </Box>
    </>
  );
}
