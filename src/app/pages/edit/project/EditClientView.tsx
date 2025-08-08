"use client";
import React, { useState } from "react";
import { GetClientResponse } from "@/types/interface"
import Navbar from "@/components/navbar/pages";
import EditProject from "@/components/component-projects/EditProject/EditProject";
import { Box } from "@mui/material";
export default function EditClientViewProject({ project, manager, states, client }: { project: any, manager: any, states: any, client: GetClientResponse }) {
  return (
    <>
      <Box>
        <Navbar />
      </Box>
      <Box>
        <EditProject managerProp={manager} project={project.data} statesProp={states} clientProp={client.clients} />
        
      </Box>
    </>
  );
}
