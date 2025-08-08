"use client";
import React from "react";
import Navbar from "@/components/navbar/pages";
import Detalle_proyecto from "@/components/component-projects/DetailProject/DetailProject";
import { Box } from "@mui/material";

export default function ClientViewProjectDetail({project}: any) {
  
    return (
    <>
      <Box sx={{ mb: 3 }}>
        <Navbar />
      </Box>
      <Box sx={{ mb: 3 }}>
        <Detalle_proyecto project={project.data} />
      </Box>
    </>
  );
}
