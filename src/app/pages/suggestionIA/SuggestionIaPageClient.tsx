"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/pages";
import { useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import ProjectHeader from "../../../components/NewProject-Suggestion/ProjectHeader";
import RoleSection from "../../../components/NewProject-Suggestion/RoleSection";
import VacancyList from "../../../components/NewProject-Suggestion/VacancyList";
import { useProjectSuggestion } from "@/context/ProjectSuggestionContext";
import ModalComponent from "@/components/message/MessageModal";
import { registerProjectService, registerVacanteService } from "@/services/api";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

export default function SuggestionIaPageClient() {
  const router = useRouter();
  const { suggestionData, projectData, reset } = useProjectSuggestion();
  useEffect(() => {
    if (!suggestionData || !projectData) {
      router.push("/pages/projects");
    }
  }, []);

  if (!suggestionData || !projectData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography fontSize={20} color="black">
          Redireccionando...
        </Typography>
      </Box>
    );
  }

  const [vacancies, setVacancies] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>(suggestionData.positions);
 
  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "success" });

  const showDialog = (
    variant: "success" | "error" | "warning",
    message?: string,
    onConfirm?: () => void
  ) => setDialog({ open: true, variant, message, onConfirm });

  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  const deleteVacancy = (vacancie: any) => {
    setVacancies((prev) =>
      prev.filter((v) => v.vacancieName !== vacancie.vacancieName)
    );
  };
  const createVacancy = (position: any) => {
    const dataVacancie = {
      manager_id: projectData.manager_id,
      manager_name: projectData.manager_name,
      vacancieName: position.role_requested,
      time: getPositionTime(position.role_requested) || "0",
      orderDate:
        getPositionRequestDate(position.role_requested) ||
        new Date().toISOString().slice(0, 10),
      startDate:
        getPositionStartDate(position.role_requested) ||
        new Date().toISOString().slice(0, 10),
      seniority: position.seniority_requested,
      skills: arrayToObjectArray(position.technologies_requested),
    };

    setVacancies((prev) => [...prev, dataVacancie]);
  };
  const selectCandidate = (position_id: string, candidate: any) => {
    setPositions((prevPositions) =>
      prevPositions.map((position) => {
        if (position.position_id !== position_id) return position;
        return {
          ...position,
          candidates: position.candidates.map((c: any) => ({
            ...c,
            selected: c.id === candidate.id ? !c.selected : false, // toggle selección
          })),
        };
      })
    );
  };

  const handleCreateProject = async () => {
    const assignedPersons = positions.flatMap((position: any) =>
      position.candidates
        .filter((c: any) => c.selected)
        .map((candidato: any) => ({
          id: candidato.id,
          name: candidato.name,
          rol: position.role_requested,
          horasAsignadas: getPositionTime(position.role_requested),
          tecnologias: position.technologies_requested,
          seniority: position.seniority_requested,
          orderDate: getPositionRequestDate(position.role_requested),
          startDate: getPositionStartDate(position.role_requested),
        }))
    );

    const projectPayload = {
      managerId: projectData.manager_id || null,
      managerName: projectData.managerName || null,
      name: projectData.name,
      image: projectData.image || null,
      client: projectData.client || null,
      status: projectData.status || null,
      projectType: "horas",
      startDate: projectData.startDate || null,
      endDate: projectData.endDate || null,
      description: projectData.description || null,
      category: (["gobierno", "privado", "inversion"].includes(
        projectData.category.toLowerCase()
      )
        ? projectData.category.toLowerCase() === "gobierno" ? "Gobierno" :
          projectData.category.toLowerCase() === "privado" ? "Privado" :
          projectData.category.toLowerCase() === "inversion" ? "Inversion" : null
        : null) as "Gobierno" | "Privado" | "Inversion" | null,
      budget: projectData.budget !== "" ? Number(projectData.budget) : null,
      managerVisibleInOrgChart: true,
      assignedPersons,
    };

    
    let newProjectId = "";
    const response = await registerProjectService(projectPayload);
    

    if (!response.id) {
      showDialog("error", "Error en el registro del proyecto");
    } else {
      newProjectId = response.id;
    }

    if (vacancies.length === 0) {
      showDialog("success", "Proyecto creado exitosamente");
      setTimeout(() => {
        router.push("/pages/projects");
      }, 3000);
      return;
    } else if (vacancies.length > 0 && !newProjectId) {
      showDialog("error", "Error al crear el proyecto");
      return;
    } else if (vacancies.length > 0 && newProjectId) {
      showDialog(
        "success",
        "Proyecto creado exitosamente. Ahora se registrarán las vacantes"
      );
      try {
        const vacantesPromises = vacancies.map((vacancie) => {
          const vacanciePayload = { ...vacancie, projectId: newProjectId };

          return registerVacanteService(vacanciePayload);
        });

        // Espera a que todas se completen
        await Promise.all(vacantesPromises);

        showDialog("success", "Proyecto y vacantes creados exitosamente");
        setTimeout(() => {
          router.push("/pages/projects");
        }, 3000);
      } catch (error) {
        showDialog("error", "Error al registrar alguna vacante");
      }
    }
  };

  function getPositionTime(roleRequested: string): string | undefined {
    const vacancy = projectData.vacancies.find(
      (v: any) => v.role === roleRequested
    );
    return vacancy?.time;
  }

  function getPositionStartDate(roleRequested: string): string | undefined {
    const vacancy = projectData.vacancies.find(
      (v: any) => v.role === roleRequested
    );
    return vacancy?.startDate?.slice(0, 10);
  }

  function getPositionRequestDate(roleRequested: string): string | undefined {
    const vacancy = projectData.vacancies.find(
      (v: any) => v.role === roleRequested
    );
    

    return vacancy?.requestDate?.slice(0, 10);
  }

  function arrayToObjectArray(arr: string[]): { name: string }[] {
    return arr.map((item) => ({ name: item }));
  }

  const handleBack = () => {
    router.push("/pages/projects");
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#F8F8F8" }}>
      <Box sx={{ mb: 3 }}>
        <Navbar />
      </Box>
      <Box
        sx={{
          mr: "55px",
          ml: "55px",
        }}
        id="back-button"
      >
        <Box
          onClick={handleBack}
          sx={{
            width: "97px",
            height: "36px ",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <KeyboardArrowLeftIcon
            sx={{ width: "24px", height: "24px", color: "#002338" }}
          />
          <Typography
            sx={{
              textAlign: "center",
              color: "#002338",
              fontSize: "20px",
              fontFamily: "Poppins",
              fontWeight: 400,
            }}
          >
            Volver
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          mr: "55px",
          ml: "55px",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "20px",
        }}
      >
        {/* datos del proyecto */}
        <ProjectHeader project={projectData} />

        {/* roles */}
        {positions.map((position: any) => (
          <RoleSection
            key={position.position_id}
            position={position}
            onSelect={selectCandidate}
            onCreateVacancy={createVacancy}
            time={getPositionTime(position.role_requested) || "0"}
          />
        ))}

        {/* vacantes */}
        <VacancyList vacancies={vacancies} onDelete={deleteVacancy} />

        <Box textAlign="right" mt={4}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCreateProject}
            sx={{
              backgroundColor: "#002338",
              borderRadius: "8px",
              width: "200px",
              height: "50px",
              textTransform: "none",
            }}
          >
            <Typography
              sx={{
                borderRadius: "10px",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "20px",
                color: "#23FFDC",
              }}
            >
              Crear proyecto
            </Typography>
          </Button>
        </Box>
      </Box>
      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </div>
  );
}
