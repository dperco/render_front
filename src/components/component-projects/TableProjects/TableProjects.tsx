import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Modal,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Save, Delete, Info } from "@mui/icons-material";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useColumns } from "@/app/hooks/useColumns";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { Project, User, Employee, AssignedPersons } from "@/types/interface";
import {
  fetchDeleteProjectById,
  editProject,
  updateCollaboratorAfterProjectDeletion,
} from "@/services/api";
import { useRouter } from "next/navigation";
import ModalComponent from "@/components/message/MessageModal";

function countCollaboratorsForProject(
  projectName: string,
  collaborators: Employee[]
) {
  const normalizedProjectName = (projectName || "").trim().toLowerCase();
  let count = 0;
  collaborators.forEach((colaborador) => {
    if (colaborador.Proyectos && Array.isArray(colaborador.Proyectos)) {
      const proyectosNombres: string[] = colaborador.Proyectos
        .filter((proyecto) => proyecto.projectId)
        .map((proyecto) => String(proyecto.projectId || ""));
      if (proyectosNombres.includes(normalizedProjectName)) {
        count++;
      }
    }
  });
  return count;
}

function getCollaboratorsForProject(
  projectName: string,
  collaborators: Employee[]
) {
  const normalizedProjectName = (projectName || "").trim().toLowerCase();
  const result: {
    nombre: string;
    tecnologia: string;
    horas: number;
    rol: string;
  }[] = [];

  collaborators.forEach((employee) => {
    if (employee.Proyectos && Array.isArray(employee.Proyectos)) {
      employee.Proyectos.forEach((proy) => {
        if (
          (proy.projectId || "").toString().trim().toLowerCase() === normalizedProjectName
        ) {
          result.push({
            nombre: `${employee.first_name} ${employee.last_name}`.trim(),
            tecnologia: proy.tecnologias,
            horas: proy.horasAsignadas,
            rol: proy.rol,
          });
        }
      });
    }
  });

  return result;
}

export function ProjectTable({
  searchTerm,
  projectsProp,
  usersProps,
  collaboratorProp,
}: {
  searchTerm: string;
  projectsProp: Project[];
  usersProps: User[];
  collaboratorProp: Employee[];
}) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(0);
  const {
    columns,
    loading: loadingColumns,
    error: errorColumns,
  } = useColumns("proyecto");
  const [managers, setManagers] = useState<{ name: string }[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const { isAdmin, currentUser } = useAuthRole();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "success" });
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  useEffect(() => {
    if (!projectsProp) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredProjects = projectsProp
      .filter((item: any) => {
        const name = item.name || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .map((item: any) => {
        let fechaFin: Date | null = null;
        if (item.endDate) {
          const parsed = new Date(item.endDate);
          if (!isNaN(parsed.getTime())) {
            fechaFin = parsed;
          }
        }

        let alertLevel = null;
        let contractMessage = null;
        let daysRemaining = null;

        if (fechaFin) {
          fechaFin.setHours(0, 0, 0, 0);
          const diffTime = fechaFin.getTime() - today.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (daysRemaining <= 30) {
            alertLevel = daysRemaining <= 0 ? "expired" : "warning";
            contractMessage =
              daysRemaining <= 0
                ? "Proyecto vencido"
                : `Vence en ${daysRemaining} días`;
          }
        }

        return {
          ...item,
          name: item.name || "",
          client: item.client || "",
          managerName: item.managerName || "",
          status: item.status ? item.status.trim() : "Ejecución",
          phase: item.phase || "",
          projectType: item.projectType || "",
          startDate: item.startDate || "",
          endDate: item.endDate || "",
          alertLevel,
          daysRemaining,
          contractMessage,
        };
      });

    setProjects(filteredProjects);
  }, [projectsProp, searchTerm]);

  useEffect(() => {
    const filteredManagers = usersProps
      .filter((user) => user.rol === "manager")
      .map((user) => ({
        name: user.name,
      }));

    setManagers(filteredManagers);
  }, [usersProps]);

  const handleDelete = async (projectId: string) => {
    const proyectoSeleccionado = projects.find(
      (p) => p.id === projectId
    );

    if (!proyectoSeleccionado) {
      alert("No se encontró el proyecto.");
      return;
    }

    const nombreProyecto = proyectoSeleccionado.name;
    const colaboradoresDelProyecto: Employee[] = collaboratorProp.filter(
      (colab: Employee) =>
        colab.Proyectos?.filter(
          (p) => (p.projectId?.toString().toLowerCase() === nombreProyecto.toLowerCase())
        ).length > 0
    );

    try {
      const result = await fetchDeleteProjectById(projectId);
      if (result.status === "success") {
        setDialog({
          open: true,
          variant: "success",
          message: "El proyecto se eliminó correctamente",
        });

        setProjects((prev) =>
          prev.filter((p) => p.id !== projectId)
        );

        for (const colab of colaboradoresDelProyecto) {
          const proyectosRestantes = colab.Proyectos.filter(
            (p) => (p.projectId?.toString().toLowerCase() !== nombreProyecto.toLowerCase())
          );

          const proyectoEliminado = colab.Proyectos.find(
            (p) => (p.projectId?.toString().toLowerCase() === nombreProyecto.toLowerCase())
          );
          const horasARestar = proyectoEliminado?.horasAsignadas || 0;

          const nuevasHoras = Math.max(
            (colab.horasAsignadas || 0) - horasARestar,
            0
          );

          await updateCollaboratorAfterProjectDeletion(colab.id, {
            Proyectos: proyectosRestantes,
            setHorasAsignadas: nuevasHoras,
            last_edited_by: currentUser,
          });
        }
      } else {
        setDialog({
          open: true,
          variant: "error",
          message: "Error al eliminar el proyecto en el backend.",
        });
      }
    } catch (err) {
      console.error("Error de red al eliminar el proyecto:", err);
    }
  };



  const handleOpenEditModal = (project: Project) => {
    setSelectedProject(project);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setSelectedProject(null);
    setOpenEditModal(false);
  };
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <>
      <Paper
        sx={{
          overflow: "hidden",
          marginLeft: "60px",
          marginRight: "60px",
          borderRadius: "20px",
        }}
      >
        <TableContainer sx={{ maxHeight: 700, borderRadius: "20px" }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {loadingColumns ? (
                  <TableCell colSpan={9} align="center">
                    Cargando configuración...
                  </TableCell>
                ) : errorColumns ? (
                  <TableCell
                    colSpan={9}
                    align="center"
                    style={{ color: "red" }}
                  >
                    {errorColumns}
                  </TableCell>
                ) : columns.length === 0 ? (
                  <TableCell colSpan={9} align="center">
                    No se encontraron columnas configuradas
                  </TableCell>
                ) : (
                  <>
                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        align="center"
                        style={{
                          backgroundColor: "#BDE0FF",
                          textAlign: "center",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                          fontSize: "16.16px",
                          color: "#000000",
                        }}
                      >
                        {column.displayName}
                      </TableCell>
                    ))}
                    <TableCell
                      align="center"
                      style={{
                        backgroundColor: "#BDE0FF",
                        textAlign: "center",
                        fontWeight: "500",
                        fontFamily: "Poppins",
                        fontSize: "16.16px",
                        color: "#000000DE",
                      }}
                    >
                      Colaboradores
                    </TableCell>
                    {isAdmin && (
                      <TableCell
                        align="left"
                        sx={{
                          backgroundColor: "#BDE0FF",
                          textAlign: "center",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                          fontSize: "16.16px",
                          color: "#000000DE",
                        }}
                      >
                        Acciones
                      </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {projects
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((project, index) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={project.id}
                  >
                    <TableCell align="center">{project.name}</TableCell>

                    <TableCell align="center">
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                      >
                        <span>{project.client}</span>

                        {project.last_edited_by && project.last_edited_on && (
                          <Tooltip
                            title={`Última modificación por ${project.last_edited_by
                              } el ${new Date(
                                project.last_edited_on
                              ).toLocaleString("es-ES", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}`}
                          >
                            <IconButton size="small">
                              <Info fontSize="small" color="primary" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {project.alertLevel && (
                          <Tooltip title={project.contractMessage || ""}>
                            <IconButton size="small">
                              {project.alertLevel === "expired" ? (
                                <PriorityHighIcon
                                  fontSize="small"
                                  color="error"
                                />
                              ) : (
                                <ReportProblemIcon
                                  fontSize="small"
                                  sx={{ color: "warning.main" }}
                                />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell align="center">{project.managerName}</TableCell>

                    <TableCell align="center">{project.status}</TableCell>

                    <TableCell align="center">{project.projectType}</TableCell>

                    <TableCell align="center">
                      {project.endDate
                        ? new Date(project.endDate).toLocaleDateString()
                        : ""}
                    </TableCell>

                    <TableCell align="center">
                      {project.startDate
                        ? new Date(project.startDate).toLocaleDateString()
                        : ""}
                    </TableCell>
                    <TableCell align="center">{project.category}</TableCell>

                    <TableCell align="center">${project.budget}</TableCell>

                    <TableCell align="center">
                      {project.assignedPersons ? project.assignedPersons.length : 0}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center">
                        {isAdmin || project.managerName === currentUser ? (
                          <>
                            <IconButton
                              onClick={() => {
                                router.push(
                                  `/pages/edit/project/${project.id}`
                                );
                              }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => {
                                const nombreProyecto = project.name || "";
                                const colaboradoresDelProyecto =
                                  project.assignedPersons || [];
                                setDialog({
                                  open: true,
                                  variant: "warning",
                                  message: `¿Estás seguro de continuar? Esto eliminará el proyecto "${project.name
                                    }" y desvinculará a ${colaboradoresDelProyecto.length
                                    } colaborador${colaboradoresDelProyecto.length === 1
                                      ? ""
                                      : "es"
                                    } asociado${colaboradoresDelProyecto.length === 1
                                      ? ""
                                      : "s"
                                    }.`,
                                  onConfirm: () =>
                                    handleDelete(project.id),
                                });
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#999" }}>
                            No permitido
                          </span>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          labelRowsPerPage="Filas por página"
          rowsPerPageOptions={[4, 10, 20]}
          component="div"
          count={projects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {snackbarSeverity === "success" && (
              <Save sx={{ color: "green", marginRight: "10px" }} />
            )}
            <Typography>{snackbarMessage}</Typography>
          </Box>
        </Alert>
      </Snackbar>
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
