"use client";
import React, { useState } from "react";
import Navbar from "@/components/navbar/pages";
import EditVacancie from "@/components/component-vacancies/EditVacancie/EditVacancie";
import { Box } from "@mui/material";
export default function EditVacancieClientView({
  vacancieProp,
  skillsProp,
  projectsProp,
  usersProp, 
  jobsProp,
  managersProp
}: any) {
  return (
    <>
      <Box>
        <Navbar />
      </Box>
      <Box>
        <EditVacancie
          skillsProp={skillsProp}
          projectsProp={projectsProp}
          vacancieProp={vacancieProp}
          usersProp={usersProp}
          jobsProp={jobsProp}
          managersProp={managersProp}
        />
      </Box>
    </>
  );
}
