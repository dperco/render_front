"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  ListItemText,
  Checkbox,
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
} from "@mui/material";

import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useRouter } from "next/navigation";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteVacancy, editVacancy } from "@/services/api";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { Vacancie, ProjectNew, User, Job, Skill } from "@/types/interface";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import ModalComponent from "@/components/message/MessageModal";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP } },
};

export default function EditVacancie({
  vacancieProp,
  jobsProp,
  skillsProp,
  projectsProp,
  usersProp,
  managersProp,
}: {
  vacancieProp: Vacancie;
  jobsProp: Job[];
  skillsProp: Skill[];
  projectsProp: ProjectNew[];
  usersProp: User[];
  managersProp: any[];
}) {
  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;

    onConfirm?: () => void;
  }>({ open: false, variant: "success" });
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));
  const showDialog = (
    variant: "success" | "error" | "warning",
    message?: string,
    onConfirm?: () => void
  ) => setDialog({ open: true, variant, message, onConfirm });
  const router = useRouter();


  const [editVacancie, setEditVacancie] = useState<any>({
    id: vacancieProp.id,
    manager_id: vacancieProp.manager_id || '',
    manager_name: vacancieProp.manager_name|| '',
    projectId: vacancieProp.projectId || '',
    vacancieName: vacancieProp.vacancieName,
    time: vacancieProp.time,
    orderDate: vacancieProp.orderDate,
    startDate: vacancieProp.startDate,
    seniority: vacancieProp.seniority,
    manager_visible_in_org_chart: vacancieProp.manager_visible_in_org_chart,
    created_at: vacancieProp.created_at,

    skills: vacancieProp.skills.map((skill) => ({ name: skill.name })),
  });
  

  const handleBack = () => {
    router.push("/pages/detail/VacanciesDetail/" + vacancieProp.id);
  };

  const { currentUser } = useAuthRole();

  const handleSave = async () => {
    try {
      const updatedVacancie = {
        ...editVacancie,
        last_edited_by: currentUser || "Desconocido",
        last_edited_on: new Date().toISOString(),
      };
      await editVacancy(editVacancie.id, updatedVacancie);
      showDialog("success", "Vacante editada exitosamente");
      router.push("/pages/detail/VacanciesDetail/" + vacancieProp.id);
    } catch (error) {
      console.error("Error al guardar la vacante:", error);
      showDialog(
        "error",
        "No se pudo guardar. Revisa la consola para más detalles."
      );
    }
  };

  function formatDateForInput(dateString?: string | Date | null) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().slice(0, 10);
  }

  const handleDeleteVacancie = async () => {
    try {
      await deleteVacancy(vacancieProp.id);
      showDialog("success", "Vacante eliminada exitosamente");
      router.push("/pages/vacantes");
    } catch (error) {
      alert("Error al eliminar vacante");
      console.error("Error al eliminar vacante:", error);
    }
  };

  useEffect(() => {
    setEditVacancie((prev: any) => ({
      ...prev,
      projectId:
        typeof vacancieProp.projectId === "object" &&
        vacancieProp.projectId !== null &&
        "id" in vacancieProp.projectId
          ? (vacancieProp.projectId as { id: string }).id
          : projectsProp.find(
              (p) =>
                p.id === vacancieProp.projectId ||
                p.name === vacancieProp.projectId
            )?.id ||
            vacancieProp.projectId ||
            "",
    }));
  }, [vacancieProp.projectId, projectsProp]);

  const handleMultipleChange = (e: SelectChangeEvent<string[]>) => {
    const selectedNames =
      typeof e.target.value === "string"
        ? e.target.value.split(",")
        : e.target.value;

    setEditVacancie((prev: any) => ({
      ...prev,
      skills: selectedNames.map((name) => ({ name })),
    }));
  };

  const mappedManagers = managersProp.map((m) => ({
    manager_id: m.id,
    manager_name: `${m.first_name} ${m.last_name}`,
  }));

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
                fontSize: "24px",
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
                  fontSize: "24px",
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  color: "#002338",
                }}
              >
                Editar vacante
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
                  fontSize: "16px",
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  color: "#002338",
                }}
              >
                Datos de la vacante
              </Typography>
            </Box>

            <Box id="vacante-details">
              <Grid container sx={{ mb: 2 }}>
                {/* <Grid item xs={12} sm={9} md={10}> */}
                <Grid container spacing={2} id="CONT">
                  <Grid item xs={12} sm={6} md={6}>
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
                      <InputLabel>Vacante</InputLabel>
                      <Select
                        name="vacancieName"
                        value={String(editVacancie.vacancieName)}
                        onChange={(e) =>
                          setEditVacancie((prev: any) => ({
                            ...prev,
                            vacancieName: e.target.value,
                          }))
                        }
                        label="Vacante"
                      >
                        {jobsProp.map((job) => (
                          <MenuItem key={job.id} value={job.name}>
                            {job.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
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
                      fullWidth
                      size="small"
                    >
                      <InputLabel>Proyecto</InputLabel>
                      <Select
                        label="Proyecto"
                        value={editVacancie.projectId}
                        onChange={(e) => {
                          setEditVacancie((prev: any) => ({
                            ...prev,
                            projectId: e.target.value,
                          }));
                        }}
                      >
                        {projectsProp
                          ?.filter((p: any) => !p.delete_at)
                          .map((p: any) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
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
                      fullWidth
                      size="small"
                    >
                      <InputLabel>Manager</InputLabel>
                      <Select
                        label="Manager"
                        value={String(editVacancie.manager_id)}
                        onChange={(e) => {
                          const selectedManager = mappedManagers.find(
                            (m) => String(m.manager_id) === e.target.value
                          );
                          setEditVacancie((prev: any) => ({
                            ...prev,
                            manager_id: e.target.value,
                            manager_name: selectedManager ? selectedManager.manager_name : "",
                          }));
                        }}
                      >
                        {mappedManagers.map((manager) => (
                          <MenuItem key={manager.manager_id} value={String(manager.manager_id)}>
                            {manager.manager_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      label="Horas Requeridas"
                      fullWidth
                      size="small"
                      value={editVacancie.time || ""}
                      onChange={(e) =>
                        setEditVacancie((prev: any) => ({
                          ...prev,
                          time: e.target.value,
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

                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      label="Fecha de pedido"
                      type="date"
                      fullWidth
                      size="small"
                      value={formatDateForInput(editVacancie.orderDate)}
                      onChange={(e) =>
                        setEditVacancie((prev: any) => ({
                          ...prev,
                          orderDate: e.target.value
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
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      label="Fecha de inicio"
                      type="date"
                      fullWidth
                      size="small"
                      value={formatDateForInput(editVacancie.startDate)}
                      onChange={(e) =>
                        setEditVacancie((prev: any) => ({
                          ...prev,
                          startDate: e.target.value
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
                  <Grid item xs={12} sm={6} md={6}>
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
                      fullWidth
                      size="small"
                    >
                      <InputLabel id="seniority-label">Seniority</InputLabel>
                      <Select
                        label="Seniority"
                        name="seniority"
                        value={editVacancie.seniority}
                        onChange={(e) =>
                          setEditVacancie((prev: any) => ({
                            ...prev,
                            seniority: e.target.value,
                          }))
                        }
                      >
                        <MenuItem value="Senior">Senior</MenuItem>
                        <MenuItem value="Semi Senior">Semi Senior</MenuItem>
                        <MenuItem value="Advanced">Advanced</MenuItem>
                        <MenuItem value="Junior">Junior</MenuItem>
                        <MenuItem value="Trainee">Trainee</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={6}>
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
                      <InputLabel>Tecnologías</InputLabel>
                      <Select
                        label="Tecnologías"
                        multiple
                        value={editVacancie.skills.map((s: any) => s.name)}
                        onChange={handleMultipleChange}
                        renderValue={(selected) => {
                          const visibles = (selected as string[])
                            .slice(0, 2)
                            .join(", ");
                          const resto = (selected as string[]).length - 2;
                          return resto > 0 ? `${visibles} +${resto}` : visibles;
                        }}
                        // MenuProps={MenuProps}
                      >
                        {skillsProp.map((skill: Skill) => (
                          <MenuItem key={skill.id} value={skill.name}>
                            <Checkbox
                              checked={editVacancie.skills.some(
                                (s: Skill) => s.name === skill.name
                              )}
                            />
                            <ListItemText primary={skill.name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                    onClick={handleDeleteVacancie}
                  >
                    Eliminar vacante
                    <DeleteIcon sx={{ ml: 1 }} />
                  </Typography>
                </Grid>
              </Grid>
              {/* </Grid> */}
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
