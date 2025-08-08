"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import { ProjectTable } from "@/components/component-projects/TableProjects/TableProjects";
import CardsProjets from "@/components/component-projects/CardProject/CardProject";
import SearchCardToggle from "@/components/SearchCard/SearchActionsBar";
import { fetchProjects } from "@/services/api";
import Navbar from "@/components/navbar/pages";

export default function ProjectClientView({
  projectsProp,
  collaboratorsProp,
  usersProp,
}: any) {
  
  const [projects, setProjects] = useState(projectsProp);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const handleAddSuccess = async () => {
    const resultProjects = await fetchProjects();
    setProjects(resultProjects);
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
        <Box sx={{ mb: 2, fontSize: "1.25rem", color: "#000" }}>Proyectos</Box>

        <Box sx={{ mb: 3 }}>
          <SearchCardToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            setSearchTerm={setSearchTerm}
            currentSection="proyecto"
            onAddClick={() => {}}
            onAddSuccess={handleAddSuccess}
          />
        </Box>

        <Box>
          {viewMode === "cards" ? (
            <CardsProjets
              projectsProp={projects}
              collaboratorProp={collaboratorsProp}
              searchTerm={searchTerm}
            />
          ) : (
            <ProjectTable
              projectsProp={projects}
              collaboratorProp={collaboratorsProp}
              searchTerm={searchTerm}
              usersProps={usersProp}
            />
          )}
        </Box>
      </Box>
    </>
  );
}
