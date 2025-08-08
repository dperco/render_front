"use client";
import ProjectFormFields from "./ProjectFormFields";
import ProjectVacancies from "./ProjectVacancies";
import ProjectActions from "./ProjectActions";
import { Grid, Box, Paper, Typography } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import ModalComponent from "@/components/message/MessageModal";
import React, { useState, useEffect } from "react";
import {
  fetchCollaborators,
  fetchManager,
  registerVacanteService,
  updateCollaboratorService,
  registerProjectService,
  fetchProjectStates,
  fetchTechnologies,
  uploadImage,
  getImageUrl,
  recommendTeam,
  getClient,
} from "@/services/api";
import {
  RegisterProjectBody,
  Employee,
  Manager,
  Tecnologia,
  Client,
  GetClientResponse
} from "@/types/interface";
import { useRouter } from "next/navigation";
import { useProjectSuggestion } from "@/context/ProjectSuggestionContext";

interface ProjectState {
  id: string;
  status: string;
}
export default function Proyecto({
  onClose,
  onSuccess,
  projectData,
}: {
  onClose: () => void;
  onSuccess: () => void;
  projectData: any;
}) {
  const router = useRouter();
  const { setProjectData, setSuggestionData } = useProjectSuggestion();

  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "success" });

  const [tecnologiasDisponibles, setTecnologiasDisponibles] = useState<
    Tecnologia[]
  >([]);

  const [formData, setFormData] = useState(
    projectData ?? {
      name: "",
      client: "",
      status: "",
      projectType: "Horas",
      startDate: "",
      endDate: "",
      manager_id: "",
      image: "",
      managerName: "",
      description: "",
      category: "",
      budget: "",
      vacancies: [
        {
          role: "",
          collaboratorId: "null",
          technology: [],
          time: "",
          requestDate: "",
          startDate: "",
          seniority: "",
        },
      ],
    }
  );

  const [estadosProyecto, setEstadosProyecto] = useState<ProjectState[]>([]);
  const [colaboradores, setColaboradores] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [tempImageUrl, setTempImageUrl] = useState<string>(projectData?.image || "");
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);

  const showDialog = (
    variant: "success" | "error" | "warning",
    message?: string,
    onConfirm?: () => void
  ) => setDialog({ open: true, variant, message, onConfirm });

  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  useEffect(() => {
    Promise.all([
      fetchCollaborators(),
      fetchManager(),
      fetchTechnologies(),
      fetchProjectStates(),
      getClient(),
    ])
      .then(([cols, mans, techs, estados, clientResponse]) => {
        setColaboradores(cols ?? []);
        setManagers(
          (mans ?? []).map((m: any) => ({
            manager_id: m.id,
            manager_name: `${m.first_name} ${m.last_name}`,
            manager_role: "Manager",
          }))
        );
        setEstadosProyecto(estados ?? []);
        setClients(clientResponse.clients ?? []);
      })
      .catch((err) => console.error("Error al obtener datos:", err));
  }, []);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target as {
      name: keyof typeof formData;
      value: string;
    };

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: Array.isArray(prevData[name]) ? [value] : value,
    }));
    setFormData((prevData: any) => {
      if (
        name === ("colaborador" as keyof typeof formData) &&
        value === "null"
      ) {
        return {
          ...prevData,
          colaborador: [""],
          rol: [""],
        };
      }

      if (name === "managerName") {
        const selectedManager =
          value === "null"
            ? null
            : managers.find((manager) => manager.manager_name === value);

        return {
          ...prevData,
          manager_name: value === "null" ? "" : value,
          manager_id: selectedManager ? selectedManager.manager_id : "",
        };
      }

      e;
      return {
        ...prevData,
        [name]: Array.isArray(prevData[name]) ? [value] : value,
      };
    });
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "name",
      "client",
      "status",
      "managerName",
      "startDate",
      "endDate",
      "category",
      "budget",
    ] as const;
    type FormDataKey = (typeof requiredFields)[number];
    const newErrors: { [key: string]: boolean } = {};
    requiredFields.forEach((field) => {
      if (!formData[field as FormDataKey]) {
        newErrors[field] = true;
      }
    });

    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const assignedPersons = formData.vacancies
      .filter((v: any) => v.collaboratorId && v.collaboratorId !== "null")
      .map((vacante: any) => {
        const colaborador = colaboradores.find(
          (c) => c.id === vacante.collaboratorId
        );
        return {
          id: vacante.collaboratorId,
          name: colaborador
            ? `${colaborador.first_name} ${colaborador.last_name}`
            : "",
          rol: vacante.role,
          horasAsignadas: vacante.time,
          tecnologias: vacante.technology,
          seniority: vacante.seniority,
          orderDate: vacante.requestDate || null,
          startDate: vacante.startDate || null,
        };
      });
    let imageUrl = formData.image || "";
    if (tempImageFile) {
      const imageKey = await uploadImage(tempImageFile);
      imageUrl = await getImageUrl(imageKey);
    }

    try {
      const projectData: RegisterProjectBody & {
        assignedPersons: typeof assignedPersons;
      } = {
        managerId: formData.manager_id || null,
        managerName: formData.managerName || null,
        name: formData.name,
        image: imageUrl || null,
        client: formData.client || null,
        status: formData.status || null,
        projectType: "Horas",
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        description: formData.description || null,
        category: (["Gobierno", "Privado", "Inversion"].includes(
          formData.category
        )
          ? formData.category
          : null) as "Gobierno" | "Privado" | "Inversion" | null,
        budget: formData.budget !== "" ? Number(formData.budget) : null,
        managerVisibleInOrgChart: true,
        assignedPersons,
      };
      let newProjectId = "";
      const response = await registerProjectService(projectData);


      if (!response.id) {
        showDialog("error", "El servidor rechazó el registro del proyecto");
      } else {
        newProjectId = response.id;

        const vacantesPromises = formData.vacancies.map(
          async (vacante: any) => {
            try {
              if (
                vacante.collaboratorId === "null" ||
                !vacante.collaboratorId
              ) {
                return await registrarVacante(vacante, newProjectId);
              } else {
                return await actualizarColaborador(
                  vacante.collaboratorId,
                  newProjectId
                );
              }
            } catch (error) {
              showDialog("error", "Error al registrar vacante");
              return null;
            }
          }
        );

        const resultVacancies = await Promise.all(vacantesPromises);


        showDialog("success", "Proyecto registrado exitosamente");
        setTimeout(() => {

          onSuccess();
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      showDialog(
        "error",
        err?.message ??
        "Error al registrar el proyecto o actualizar el colaborador"
      );
    }
  };
  const registrarVacante = async (vacante: any, newProjectId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const managerId = formData.manager_id;
      const managerName = formData.managerName?.trim() || "";
      const vacancieRole = vacante.role?.trim() || "";
      const seniority = vacante.seniority?.trim() || "";
      const time = Number(vacante.time) || 0;

      // Validación más estricta
      if (
        !managerId ||
        !managerName ||
        !vacancieRole ||
        !seniority ||
        time <= 0
      ) {
        showDialog("error", "Faltan datos obligatorios para crear la vacante");
        return;
      }

      const skills = Array.isArray(vacante.technology)
        ? vacante.technology
          .map((techName: string) => {
            const tech = tecnologiasDisponibles.find(
              (t) => t.name === techName
            );
            return {
              name: tech?.name,
            };
          })
          .filter((skill: any) => skill.technologyId)
        : [];

      // Construir vacancieName de forma más segura
      const techNames = Array.isArray(vacante.technology)
        ? vacante.technology.filter(Boolean).join(", ")
        : "";

      const vacancieName = vacancieRole + (techNames ? " - " + techNames : "");

      const payload = {
        manager_id: managerId,
        manager_name: managerName,
        vacancieName: vacancieName.trim(),
        projectId: newProjectId?.trim() || "",
        time: time,
        orderDate: (vacante.requestDate || today).trim(),
        startDate: (vacante.startDate || today).trim(),
        seniority: seniority,
        skills: skills,
      };

      const result = await registerVacanteService(payload);
      if (
        !result ||
        (typeof result.status === "number" &&
          (result.status < 200 || result.status >= 300))
      ) {
        showDialog("error", "El servidor rechazó el registro del Vacante");
      }
    } catch (err) {
      console.error("Error completo:", err);
      showDialog("error", "Error al registrar vacante. Mirá la consola.");
      throw err;
    }
  };

  const actualizarColaborador = async (
    colaboradorId: string,
    projectId: string
  ) => {
    try {
      const colaboradorData = colaboradores.find((c) => c.id === colaboradorId);

      if (!colaboradorData) {
        console.error("No se encontró el colaborador con ID:", colaboradorId);
        showDialog("error", "No se encontró el colaborador");
        return;
      }

      const vacanteAsociada = formData.vacancies.find(
        (v: any) => String(v.collaboratorId) === String(colaboradorId)
      );

      const proyectosActuales = Array.isArray(colaboradorData.Proyectos)
        ? colaboradorData.Proyectos.map((p: any) => ({
          rol: p.rol || "",
          projectId: p.projectId?.id || p.projectId || p.id || "",
          tecnologias: Array.isArray(p.tecnologias)
            ? p.tecnologias.join(", ")
            : p.tecnologias || "",
          horasAsignadas: Number(p.horasAsignadas) || 0,
          seniority: p.seniority || "",
        }))
        : [];

      let proyectosActualizados = [...proyectosActuales];

      if (vacanteAsociada) {
        const horasNuevas = Number(vacanteAsociada.time) || 0;
        const nombreProyecto = formData.name ?? "";
        const id = projectId;

        if (nombreProyecto) {
          const nuevoProyecto = {
            rol: vacanteAsociada.role || "",
            projectId: id,
            tecnologias: vacanteAsociada.technology || "",
            horasAsignadas: horasNuevas,
            seniority: vacanteAsociada.seniority || "",
            orderDate: vacanteAsociada.requestDate || "",
            startDate: vacanteAsociada.startDate || "",
          };

          const idx = proyectosActualizados.findIndex(
            (p) => p.projectId === projectId
          );
          if (idx >= 0) {
            proyectosActualizados[idx] = nuevoProyecto;
          } else {
            proyectosActualizados.push(nuevoProyecto);
          }
        }
      }

      const payload = {
        first_name: colaboradorData.first_name,
        last_name: colaboradorData.last_name,
        email: colaboradorData.email,
        Proyectos: proyectosActualizados,
        tecnologias: colaboradorData.tecnologias ?? [],
        rol: Array.isArray(colaboradorData.roles)
          ? colaboradorData.roles.map((r: any) => r.rol).join(", ")
          : colaboradorData.roles,
        estado: colaboradorData.estado || "activo",
        horasAsignadas: vacanteAsociada
          ? vacanteAsociada.time
          : colaboradorData.horasAsignadas,
        last_edited_on: new Date().toISOString(),
        delete_at: null,
      };

      const result = await updateCollaboratorService(colaboradorId, payload);

      if (
        !result ||
        (typeof result.status === "number"
          ? result.status < 200 || result.status >= 300
          : result.status !== "success")
      ) {
        showDialog(
          "error",
          "El servidor rechazó el registrar proyecto al colaborador"
        );
        return;
      }

      showDialog("success", "Colaborador actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el colaborador:", error);
      showDialog("error", "¡Uy! Algo falló");
    }
  };

  const handleVacanteChange = (
    index: number,
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = event.target;

    setFormData((prevData: any) => {
      const updatedVacancies = [...prevData.vacancies];
      updatedVacancies[index] = {
        ...updatedVacancies[index],
        [name]: value,
      };

      return {
        ...prevData,
        vacancies: updatedVacancies,
      };
    });
  };

  const addVacante = () => {
    setFormData((prevData: any) => ({
      ...prevData,
      vacancies: [
        ...prevData.vacancies,
        {
          role: "",
          collaboratorId: "null",
          technology: [],
          time: "",
          requestDate: "",
          startDate: "",
          seniority: "",
        },
      ],
    }));
  };

  const removeVacante = (index: number) => {
    setFormData((prevData: any) => ({
      ...prevData,
      vacancies: prevData.vacancies.filter((_: any, i: any) => i !== index),
    }));
  };

  useEffect(() => {
    async function loadTechnologies() {
      try {
        const techDocs = await fetchTechnologies();
        setTecnologiasDisponibles(techDocs);
      } catch (err) {
        showDialog("error", "Error al cargar tecnologías: " + err);
      }
    }
    loadTechnologies();
  }, []);

  const handleCreateAISuggestion = async () => {
    const requiredFields = [
      "name",
      "client",
      "status",
      "managerName",
      "startDate",
      "endDate",
      "budget",
      "category",
    ] as const;
    type FormDataKey = (typeof requiredFields)[number];
    const newErrors: { [key: string]: boolean } = {};
    requiredFields.forEach((field) => {
      if (!formData[field as FormDataKey]) {
        newErrors[field] = true;
      }
    });

    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const payload = {
      request_details: {
        request_date: formData.startDate,
        start_date: formData.startDate,
        budget: Number(formData.budget),
        objective: `Proyecto ${formData.name} - ${formData.description}`,
      },
      positions_requested: formData.vacancies.map(
        (vacante: any, index: any) => ({
          position_id: vacante.role + "-" + index + 1,
          role: vacante.role,
          technologies: Array.isArray(vacante.technology)
            ? vacante.technology
            : [],
          seniority: vacante.seniority,
          assigned_hours_needed: Number(vacante.time),
          quantity: 1,
          suggestedId:
            vacante.collaboratorId === "null"
              ? undefined
              : vacante.collaboratorId,
        })
      ),
    };

    try {
      const iaResult = await recommendTeam(payload);

      setSuggestionData(iaResult.data); // Guardo la respuesta de la IA en el context
      setProjectData({
        ...formData,
        image: tempImageUrl
      });

      router.push(
        `/pages/suggestionIA` // Redirijo a la página de sugerencias
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setTempImageFile(file);
    setTempImageUrl(URL.createObjectURL(file));
  };

  return (
    <>
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "none",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            align="center"
            sx={{
              textAlign: "left",
              fontSize: "20px",
              fontWeight: 500,
              color: "#002338",
            }}
          >
            Nuevo Proyecto
          </Typography>
          <Grid
            container
            spacing={2.5}
            sx={{ mb: 2, paddingLeft: 3, paddingTop: 2 }}
          >
            <ProjectFormFields
              formData={formData}
              fieldErrors={fieldErrors}
              estadosProyecto={estadosProyecto}
              managers={managers}
              clients={clients}
              tempImageUrl={tempImageUrl}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleFileUpload={handleFileUpload}
            />
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                borderTop: "1px solid #ccc",
                paddingY: 1,
                textAlign: "left",
              }}
            >
              <Typography
                sx={{ fontSize: "20px", fontWeight: 500, color: "#002338" }}
              >
                Staff Requerido
              </Typography>
            </Box>
          </Grid>
          <ProjectVacancies
            formData={formData}
            setFormData={setFormData}
            colaboradores={colaboradores}
            tecnologiasDisponibles={tecnologiasDisponibles}
            handleVacanteChange={handleVacanteChange}
            addVacante={addVacante}
            removeVacante={removeVacante}
          />
          <ProjectActions
            onClose={onClose}
            handleSubmit={handleSubmit}
            handleCreateAISuggestion={handleCreateAISuggestion}
          />
        </Paper>
      </Box>
      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </>
  );
}
