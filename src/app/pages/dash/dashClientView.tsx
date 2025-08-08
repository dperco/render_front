"use client";
import React from "react";
import { Grid2 } from "@mui/material";
import Navbar from "@/components/navbar/pages";
import Dash from "@/components/component-dash/Dashboard";

export default function DashClientView({
    metrics,
}: any) {
    return (

        <Grid2
            container
            spacing={2}
            sx={{ marginBottom: "20px" }}
            id={"GRIDCONTAINER"}
        >
            <Navbar />


            <Grid2
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Dash
                    metricsProp={metrics}
                />
            </Grid2>
        </Grid2>
    );
}
