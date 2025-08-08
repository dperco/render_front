"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Card,
  IconButton,
  Typography,
  Collapse,
  Divider,
  Grid2,
  InputAdornment,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Employee, User, Project, Job, Tecnologia } from "@/types/interface";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  removecollaborator,
  removeAssignedPerson,
  updateCollaboratorServiceedit,
  addAssignedPersonToProject,
  updateAssignedPersonToProject,
  getJobs,
  uploadImage,
  getImageUrl,
} from "@/services/api";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { Slider } from "@mui/material";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import ModalComponent from "@/components/message/MessageModal";
import { useAuthRole } from "@/app/hooks/useAuthRole";
export default function EditEmploye({
  techProp,
  projectProp,
  colabId,
  usersProp,
}: {
  techProp: Tecnologia[];
  projectProp: Project[];
  colabId: Employee;
  usersProp: User[];
}) {
  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;

    onConfirm?: () => void;
  }>({ open: false, variant: "success" });
  const closeDialog = () => setDialog(d => ({ ...d, open: false }));
  const showDialog = (
    variant: "success" | "error" | "warning",
    message?: string,
    onConfirm?: () => void
  ) => setDialog({ open: true, variant, message, onConfirm });
  const router = useRouter();
  const [editedColab, setEditedColab] = useState<Employee>(colabId);
  const [techSelectOpen, setTechSelectOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsList = await getJobs();
        setJobs(jobsList);
      } catch (error) {
        showDialog("error", "Error al cargar los puestos de trabajo");
      }
    };
    fetchJobs();
  }, []);
  useEffect(() => {
    setEditedColab({
      ...colabId,
      roles:
        colabId.roles && colabId.roles.length > 0
          ? colabId.roles
          : [{ rol: "", seniority: "" }],
    });
  }, [colabId]);

  const handleBack = () => {
    router.push(`/pages/detail/collaborator_detail/${editedColab.id}`);
  };
  const { currentUser, isAdmin } = useAuthRole();
  const handleSave = async () => {
    try {
      const origName = `${colabId.first_name} ${colabId.last_name}`.trim();
      const newName = `${editedColab.first_name} ${editedColab.last_name}`.trim();
      const origTech = colabId.tecnologias || [];
      const newTech = editedColab.tecnologias || [];
      const techChanged = JSON.stringify(origTech) !== JSON.stringify(newTech);
      const editedBy = currentUser || "desconocido";
      const timestamp = new Date().toISOString();
      const originalUniform = (colabId.Proyectos || []).map(a => {
        const raw = a.projectId as any;
        const id = typeof raw === "object" ? raw.id ?? raw._id : raw;
        const name =
          typeof raw === "object" && raw.name
            ? raw.name
            : projectProp.find(p => p.id === id)?.name ?? "";
        return {
          ...a,
          projectId: { id, name },
        };
      });

      const proyectosUniformes = (editedColab.Proyectos || []).map(a => {
        const raw = a.projectId as any;
        const id = typeof raw === "object" ? raw.id ?? raw._id : raw;
        const name =
          typeof raw === "object" && raw.name
            ? raw.name
            : projectProp.find(p => p.id === id)?.name ?? "";
        return {
          ...a,
          projectId: { id, name },
        };
      });

      const proyectosValidos = proyectosUniformes.filter(
        ({ projectId: { id } }) =>
          projectProp.some(p => p.id === id && !p.delete_at)
      );


      const originalIds = originalUniform.map(a => a.projectId.id);
      const newIds = proyectosValidos.map(a => a.projectId.id);


      const removidos = originalIds.filter(id => !newIds.includes(id));
      const añadidos = newIds.filter(id => !originalIds.includes(id));
      const comunes = newIds.filter(id => originalIds.includes(id));


      for (const pid of removidos) {
        await removeAssignedPerson(pid, editedColab.id);
      }


      for (const pid of añadidos) {
        const asign = proyectosValidos.find(a => a.projectId.id === pid)!;
        const proyectoObj = projectProp.find(p => p.id === pid)!;
        await addAssignedPersonToProject(proyectoObj.id, {
          id: editedColab.id,
          name: `${editedColab.first_name} ${editedColab.last_name}`,
          rol: asign.rol,
          seniority: asign.seniority,
          tecnologias: editedColab.tecnologias || [],
          horasAsignadas: asign.horasAsignadas,
        });
      }


      for (const pid of comunes) {
        const orig = originalUniform.find(x => x.projectId.id === pid)!;
        const edit = proyectosValidos.find(x => x.projectId.id === pid)!;
        const nameChanged = origName !== newName;

        if (
          orig.horasAsignadas !== edit.horasAsignadas ||
          orig.rol !== edit.rol ||
          orig.seniority !== edit.seniority ||
          nameChanged ||
          techChanged
        ) {
          await updateAssignedPersonToProject(
            pid,
            editedColab.id,
            {
              name: newName,
              rol: edit.rol,
              seniority: edit.seniority,
              tecnologias: newTech,
              horasAsignadas: edit.horasAsignadas,
            }
          );
        }
      }


      let imageUrl = editedColab.image || "";
      if (tempImageFile) {
        const imageKey = await uploadImage(tempImageFile);
        imageUrl = await getImageUrl(imageKey);
      }
      const totalHoras = proyectosValidos.reduce((sum, a) => sum + a.horasAsignadas, 0);
      const colabToSave = {
        ...editedColab,
        Proyectos: proyectosValidos.map(a => ({
          ...a,
          projectId: a.projectId.id,
        })),
        dni: editedColab.dni,
        horasAsignadas: totalHoras,
        roles: editedColab.roles,
        created_at: editedColab.created_at
          ? new Date(editedColab.created_at).toISOString()
          : null,
        fin_contrato: editedColab.fin_contrato
          ? new Date(editedColab.fin_contrato).toISOString()
          : null,
        honorarios: editedColab.honorarios,
        image: imageUrl,
        last_edited_by: editedBy,
        last_edited_on: timestamp,
      };

      const resp = await updateCollaboratorServiceedit(editedColab.id, colabToSave);
      if (resp.status === "success") {
        showDialog("success", "¡Colaborador actualizado exitosamente!");
        setTimeout(() => router.push(`/pages/detail/collaborator_detail/${editedColab.id}`), 2000);
      }
    } catch (error) {
      showDialog("error", "No se pudo guardar. Revisa la consola para más detalles.");
    }
  };

  function formatDateForInput(dateString?: string | Date | null) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().slice(0, 10);
  }
  const handleDeleteColaborador = async () => {
    try {
      if (editedColab.Proyectos && editedColab.Proyectos.length > 0) {
        for (const assignment of editedColab.Proyectos) {
          const projId = typeof assignment.projectId === 'object' ? assignment.projectId.id : assignment.projectId;
          if (projId) {
            await removeAssignedPerson(projId, editedColab.id);
          }
        }
      }
      await removecollaborator(editedColab.id);
      showDialog("success", "¡Colaborador eliminado exitosamente!");
      setTimeout(() => router.push(`/pages/collaborators`), 2000);
    } catch (error) {
      showDialog("error", "Error al eliminar el colaborador");
    }
  };
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };
  const [tempImageUrl, setTempImageUrl] = useState<string>(editedColab.image || "");
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTempImageFile(file);
    setTempImageUrl(URL.createObjectURL(file));
  };
  return (
    <>
      <Grid2
        container
        sx={{
          marginLeft: "55px",
          marginRight: "55px",
        }}
      >
        <Grid2 size={12}>
          <Grid2
            onClick={handleBack}
            sx={{
              width: "97px",
              height: "36px",
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
          </Grid2>
        </Grid2>
        <Grid2 size={12} mt={"30px"}>
          <Card
            elevation={6}
            sx={{
              width: { xs: "90%", md: "100%" },
              borderRadius: "20px",
              backgroundColor: "#FFFFFF",
              padding: "40px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 24, md: "32px" },
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  color: "#002338",
                }}
              >
                Editar Colaborador
              </Typography>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  background: "#0087FF",
                  borderRadius: "20px",
                  padding: "12px 41px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: "20px",
                  height: "50px",
                  color: "#FFFFFF",
                  boxShadow: "none",
                  textTransform: "none",
                  "&:hover": {
                    background: "#0066CC",
                    boxShadow: "none",
                  },
                }}
              >
                Guardar
              </Button>
            </Box>

            <Box sx={{ px: { xs: 1, md: 3 }, pb: 3 }}>
              <Grid container spacing={2} sx={{ mb: 2 }} >
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    color: "#002338",
                    mb: 1,
                  }}
                >
                  Datos base:
                </Typography>
              </Grid>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  md={2}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >

                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: "#fff",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #e0e4e7",
                      mb: 1,
                    }}
                  >
                    <img
                      src={tempImageUrl ? tempImageUrl : "/images/anonimo.jpeg"}
                      alt="Logo"
                      style={{ maxWidth: "80%", maxHeight: "80%" }}
                    />
                  </Box>
                  <IconButton
                    onClick={handleCameraClick}
                    sx={{
                      bgcolor: "#f8f9fa",
                      border: "1px solid #e0e4e7",
                      mt: -2,
                      mb: 1,
                      "&:hover": { bgcolor: "#e8f0fe" },
                    }}
                  >
                    <PhotoCameraIcon sx={{ color: "#5f6368", fontSize: "18px" }} />
                  </IconButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </Grid>

                <Grid item xs={12} sm={9} md={10}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="DNI"
                        fullWidth
                        size="small"
                        value={editedColab.dni}
                        onChange={(e) =>
                          setEditedColab((prev) => ({
                            ...prev,
                            dni: Number(e.target.value),
                          }))
                        }
                        sx={{
                          height: "40px",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                            "& fieldset": {
                              borderColor: "#002338",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Nombre"
                        fullWidth
                        size="small"
                        value={editedColab.first_name || ""}
                        onChange={(e) =>
                          setEditedColab((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
                        }
                        sx={{
                          height: "40px",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                            "& fieldset": {
                              borderColor: "#002338",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Apellido"
                        fullWidth
                        size="small"
                        value={editedColab.last_name || ""}
                        onChange={(e) =>
                          setEditedColab((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
                        sx={{
                          height: "40px",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                            "& fieldset": {
                              borderColor: "#002338",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Fecha de Ingreso"
                        type="date"
                        fullWidth
                        size="small"
                        value={formatDateForInput(editedColab.start_contrato)}
                        onChange={(e) =>
                          setEditedColab((prev) => ({
                            ...prev,
                            start_contrato: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          height: "40px",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                            "& fieldset": {
                              borderColor: "#002338",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Fecha de Egreso"
                        type="date"
                        fullWidth
                        size="small"
                        value={formatDateForInput(editedColab.fin_contrato)}
                        onChange={(e) =>
                          setEditedColab((prev) => ({
                            ...prev,
                            fin_contrato: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          height: "40px",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                            "& fieldset": {
                              borderColor: "#002338",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      sx={{
                        color: "red",
                        cursor: "pointer",
                        mt: "20px",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onClick={() =>
                        showDialog(
                          "warning",
                          `¿Estás seguro de eliminar al colaborador ${editedColab.first_name} ${editedColab.last_name}?`,
                          handleDeleteColaborador
                        )
                      }
                    >
                      Eliminar colaborador
                      <DeleteIcon sx={{ ml: 1 }} />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ px: { xs: 1, md: 3 }, pb: 3 }}>
              <Typography sx={{
                fontSize: "20px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                color: "#002338",
                mb: 1,
              }}>
                Datos complementarios:
              </Typography>
              <Grid container spacing={2} >
                <Grid item xs={12} sm={6} >
                  <TextField
                    label="Email"
                    fullWidth
                    size="small"
                    value={editedColab.email || ""}
                    onChange={(e) =>
                      setEditedColab((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    sx={{
                      height: "40px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "20px",
                        "& fieldset": {
                          borderColor: "#002338",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl sx={{
                    height: "40px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                      "& fieldset": {
                        borderColor: "#002338",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                  }}
                    size="small"
                    fullWidth>
                    <InputLabel id="modalidad-label">Modalidad</InputLabel>
                    <Select
                      labelId="modalidad-label"
                      label="Modalidad"
                      value={editedColab.estado || ""}
                      onChange={(e) =>
                        setEditedColab((prev) => ({ ...prev, estado: e.target.value }))
                      }

                    >
                      <MenuItem value="Tiempo Completo">Tiempo Completo</MenuItem>
                      <MenuItem value="Medio Tiempo">Medio Tiempo</MenuItem>
                      <MenuItem value="Pasante">Pasante</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {isAdmin && (
                  <Grid item xs={12} sm={6} >
                    <TextField
                      label="Honorario"
                      fullWidth
                      size="small"
                      value={editedColab.honorarios}
                      onChange={(e) =>
                        setEditedColab((prev) => ({
                          ...prev,
                          honorarios: Number(e.target.value),
                        }))
                      }
                      sx={{
                        height: "40px",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "20px",
                          "& fieldset": {
                            borderColor: "#002338",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
            <Box sx={{ px: { xs: 1, md: 3 }, pb: 3, mt: 2 }}>
              <Box sx={{
                pb: 3,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    width: "100%",
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    color: "#002338",
                    mb: 1,
                  }}
                >
                  Puestos de trabajo:
                </Typography>
                <Button
                  onClick={() =>
                    setEditedColab(prev => ({
                      ...prev,
                      roles: [...prev.roles!, { rol: "", seniority: "" }],
                    }))
                  }
                  sx={{
                    width: "230px",
                    height: "50px",
                    backgroundColor: "#0087FF",
                    color: "#fff",
                    borderRadius: "20px",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#0066CC",
                    },
                  }}
                >
                  + Agregar Puesto
                </Button>
              </Box>

              {editedColab.roles!.map((roleObj, idx) => (
                <Grid container spacing={2} alignItems="center" key={idx} sx={{ mb: 1 }}>
                  {/* Select Puesto */}
                  <Grid item xs={5} sm={4} md={3}>
                    <FormControl sx={{
                      height: "40px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "20px",
                        "& fieldset": {
                          borderColor: "#002338",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                    }}
                      size="small"
                      fullWidth>
                      <InputLabel id={`rol-label-${idx}`}>Puesto</InputLabel>
                      <Select
                        labelId={`rol-label-${idx}`}
                        label="Puesto"
                        value={roleObj.rol}
                        onChange={e => {
                          const roles = [...editedColab.roles!];
                          roles[idx] = { ...roles[idx], rol: e.target.value };
                          setEditedColab(prev => ({ ...prev, roles }));
                        }}

                      >
                        {jobs.map((job) => (
                          <MenuItem key={job.id} value={job.name}>
                            {job.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={5} sm={4} md={3}>
                    <FormControl sx={{
                      height: "40px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "20px",
                        "& fieldset": {
                          borderColor: "#002338",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                    }}
                      size="small"
                      fullWidth>
                      <InputLabel id={`seniority-label-${idx}`}>Seniority</InputLabel>
                      <Select
                        labelId={`seniority-label-${idx}`}
                        label="Seniority"
                        value={roleObj.seniority}
                        onChange={e => {
                          const roles = [...editedColab.roles!];
                          roles[idx] = { ...roles[idx], seniority: e.target.value };
                          setEditedColab(prev => ({ ...prev, roles }));
                        }}

                      >
                        {["-", "Senior", "Semi Senior", "Junior Advanced", "Junior", "Trainee"].map(s => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={2} sm={4} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <IconButton
                      onClick={() => {
                        const roles = editedColab.roles!.filter((_, i) => i !== idx);
                        setEditedColab(prev => ({ ...prev, roles }));
                      }}
                      sx={{ color: "#d32f2f", display: "flex", alignItems: "center", marginLeft: "460px" }}
                      aria-label="Eliminar puesto"
                      title="Eliminar puesto"
                    >
                      <CloseIcon />
                      <Typography
                        sx={{
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                          color: "#d32f2f",
                          fontWeight: 500,
                          textTransform: "none",
                        }}
                      >
                        Eliminar puesto
                      </Typography>
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Box>
            <Box sx={{ px: { xs: 1, md: 3 }, pb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Tecnologías
              </Typography>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{
                  height: "40px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    "& fieldset": {
                      borderColor: "#002338",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                }}
                  size="small"
                  fullWidth>
                  <InputLabel id="tecnologias-label">
                    Agregar tecnología
                  </InputLabel>
                  <Select
                    label="Agregar tecnología"
                    multiple
                    open={techSelectOpen}
                    onOpen={() => setTechSelectOpen(true)}
                    onClose={() => setTechSelectOpen(false)}
                    value={[]}
                    onChange={(e) => {
                      const newTechs = e.target.value as string[];
                      setEditedColab((prev) => ({
                        ...prev,
                        tecnologias: [
                          ...(prev.tecnologias || []),
                          ...newTechs.filter(
                            (t) => !(prev.tecnologias || []).includes(t)
                          ),
                        ],
                      }));
                      setTechSelectOpen(false);
                    }}
                    renderValue={() => ""}
                  >
                    {techProp.map((t, index) => (
                      <MenuItem
                        key={`tech-select-${t.id || index}`}
                        value={t.name}
                      >
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                    {(editedColab.tecnologias || []).map((tecnologia, idx) => {
                      const techObj = techProp.find((t) => t.name === tecnologia);
                      return (
                        <Chip
                          key={`tech-chip-${tecnologia}-${idx}`}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <span>{tecnologia}</span>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setEditedColab((prev) => ({
                                    ...prev,
                                    tecnologias:
                                      prev.tecnologias?.filter(
                                        (t) => t !== tecnologia
                                      ) || [],
                                  }))
                                }
                                sx={{
                                  ml: 1,
                                  background: "#d32f2f",
                                  color: "#fff",
                                  width: 22,
                                  height: 22,
                                  "&:hover": {
                                    background: "#b71c1c",
                                  },
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          }
                          sx={{
                            background: "#e5e8eb",
                            color: "#002338",
                            fontWeight: 600,
                            fontFamily: "Poppins, sans-serif",
                            mr: 1,
                            mb: 1,
                            ".MuiChip-label": {
                              display: "flex",
                              alignItems: "center",
                              px: 1,
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ ml: { xs: 0, md: "30px" }, mr: { xs: 0, md: "30px" } }}>
              <Box sx={{
                pb: 3,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}>
                <Typography variant="subtitle1" sx={{
                  fontSize: "20px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  color: "#002338",
                }}>
                  Asignaciones:
                </Typography>
                <Button
                  onClick={() =>
                    setEditedColab(prev => ({
                      ...prev,
                      Proyectos: [
                        ...(prev.Proyectos || []),
                        {
                          projectId: { id: "", name: "" } as { id: string; name: string },
                          rol: "",
                          seniority: "",
                          horasAsignadas: 0,
                          tecnologias: "",
                        },
                      ],
                    }))
                  }

                  sx={{
                    width: "230px",
                    height: "50px",
                    backgroundColor: "#0087FF",
                    color: "#fff",
                    borderRadius: "20px",
                    px: 4,
                    py: 1,
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#0066CC",
                    },
                  }}
                >
                  + Agregar Asignación
                </Button>
              </Box>
              {editedColab.Proyectos && editedColab.Proyectos.length > 0 ? (
                editedColab.Proyectos.map((asig, idx) => (
                  <Grid container spacing={2} key={`${asig.projectId?.id ?? idx}-${idx}`} sx={{ mb: 1 }}>
                    <Grid item xs={4}>
                      {asig.projectId && asig.projectId.id ? (
                        <TextField
                          label="Proyecto"
                          fullWidth
                          size="small"
                          value={asig.projectId.name}
                          disabled
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              color: "#6c757d",
                              fontFamily: "Poppins",
                              fontSize: "14px",
                              height: "40px",
                              borderRadius: "20px",
                              padding: "12px 16px",
                            },
                            "& .MuiInputLabel-root.Mui-disabled": {
                              color: "#6c757d",
                            },
                          }}
                        />
                      ) : (

                        <FormControl sx={{
                          height: "40px",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                            "& fieldset": {
                              borderColor: "#002338",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                        }}
                          size="small"
                          fullWidth>
                          <InputLabel id={`proyecto-label-${idx}`}>Proyecto</InputLabel>
                          <Select
                            labelId={`proyecto-label-${idx}`}
                            label="Proyecto"
                            value={asig.projectId && 'id' in asig.projectId ? asig.projectId.id : ""}
                            onChange={e => {
                              const selId = e.target.value as string;
                              const proj = projectProp.find(p => p.id === selId)!;
                              setEditedColab(prev => ({
                                ...prev,
                                Proyectos: prev.Proyectos!.map((item, i) =>
                                  i === idx
                                    ? {
                                      ...item,
                                      projectId: { id: proj.id, name: proj.name },
                                    }
                                    : item
                                ),
                              }));
                            }}

                          >
                            {projectProp.filter(p => !p.delete_at).map(p => (
                              <MenuItem key={p.id} value={p.id}>
                                {p.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                      )}
                    </Grid>
                    <Grid item xs={4}>
                      <FormControl
                        sx={{
                          height: "40px",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                            "& fieldset": {
                              borderColor: "#002338",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                        }}
                        size="small"
                        fullWidth
                      >
                        <InputLabel id={`rol-label-${idx}`}>Rol</InputLabel>
                        <Select
                          labelId={`rol-label-${idx}`}
                          label="Rol"
                          value={asig.rol || ""}
                          onChange={e => {
                            const selectedRol = e.target.value as string;
                            const rolObj = editedColab.roles!.find(r => r.rol === selectedRol);
                            const nuevaSeniority = rolObj?.seniority ?? "";

                            setEditedColab(prev => ({
                              ...prev,
                              Proyectos: prev.Proyectos!.map((item, i) =>
                                i === idx
                                  ? { ...item, rol: selectedRol, seniority: nuevaSeniority }
                                  : item
                              ),
                            }));
                          }}
                        >
                          {editedColab.roles!
                            .filter(r => r.rol)
                            .map((r, i) => (
                              <MenuItem key={i} value={r.rol}>
                                {r.rol}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Seniority"
                        value={
                          editedColab.roles?.find(r => r.rol === asig.rol)?.seniority || "-"
                        }
                        fullWidth
                        size="small"
                        sx={{
                          height: "40px",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                            "& fieldset": {
                              borderColor: "#002338",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                        }}
                      >
                        <InputLabel id={`seniority-label-${idx}`}>Seniority</InputLabel>
                        <Select
                          labelId={`seniority-label-${idx}`}
                          label="Seniority"
                          value={asig.seniority || ""}
                          onChange={e =>
                            setEditedColab(prev => ({
                              ...prev,
                              Proyectos: prev.Proyectos!.map((item, i) =>
                                i === idx ? { ...item, seniority: e.target.value } : item
                              ),
                            }))
                          }

                        >
                          <MenuItem value={asig.seniority}>{asig.seniority}</MenuItem>
                        </Select>
                      </TextField>
                    </Grid>
                    <Grid item xs={8}>
                      <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                       <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Typography variant="body2">
                            Horas asignadas (%)
                          </Typography>
                        </Grid>
                        <Grid item xs>
                          <Slider
                            min={0}
                            max={160}
                            step={1}
                            value={asig.horasAsignadas ?? 0}
                            onChange={(_, v) =>
                              setEditedColab(prev => ({
                                ...prev,
                                Proyectos: prev.Proyectos!.map((item, i) =>
                                  i === idx ? { ...item, horasAsignadas: v as number } : item
                                ),
                              }))
                            }
                            valueLabelDisplay="auto"
                            sx={{ mt: 1, mr: 1 }}
                          />
                        </Grid>
                        <Grid item>
                          <TextField
                            type="number"
                            size="small"
                             value={
                              asig.horasAsignadas !== undefined
                                ? asig.horasAsignadas
                                : ""
                            }
                            onChange={e => {
                              const v = Number(e.target.value);
                              if (!isNaN(v) && v >= 0 && v <= 160) {
                                setEditedColab(prev => ({
                                  ...prev,
                                  Proyectos: prev.Proyectos!.map((item, i) =>
                                    i === idx ? { ...item, horasAsignadas: v } : item
                                  ),
                                }));
                              }
                            }}
                            InputProps={{
                              inputProps: {
                                min: 0,
                                max: 160,
                                step: 1,
                                style: { textAlign: "right" },
                              },
                              endAdornment: (
                                <InputAdornment position="end">hs</InputAdornment>
                              ),
                            }}
                            sx={{
                              width: 100,
                            }}
                          />
                        </Grid>
                      </Grid>
                      </Box>
                    </Grid>
                    <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <IconButton
                        sx={{ color: "red", mt: 4, ml: "200px", display: "flex", alignItems: "center" }}
                        onClick={async () => {
                          const projId = asig.projectId.id;
                          if (projId) {
                            try {
                              await removeAssignedPerson(
                                projId,
                                editedColab.id
                              );
                            } catch (error) {
                              showDialog("error", "No se pudo eliminar la asignación");
                            }
                          }
                          setEditedColab(prev => ({
                            ...prev,
                            Proyectos: prev.Proyectos.filter((_, i) => i !== idx),
                          }));
                        }}
                        aria-label="Eliminar asignación"
                        title="Eliminar asignación"
                      >
                        <DeleteIcon sx={{ mr: 1 }} />
                        <Typography
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "14px",
                            color: "red",
                            fontWeight: 500,
                            textTransform: "none",
                          }}
                        >
                          Eliminar asignación
                        </Typography>
                      </IconButton>

                    </Grid>
                  </Grid>
                ))
              ) : (
                <Typography color="text.secondary">Sin asignaciones</Typography>
              )}


            </Box>


          </Card>
        </Grid2>
      </Grid2>

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
