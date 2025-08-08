"use client";

import { useEffect, useState } from "react";
import { getJobs } from "@/services/api";

import JobsModal from "./JobsModal";

import {
  Grid2,
  Box,
  Button,
  IconButton,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import TrashIcon from "@mui/icons-material/Delete";
import { deleteJob } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";
import { Job } from "@/types/interface";

export default function Jobs() {
  /* Estado de datos */
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobDelete, setJobDelete] = useState<any>(undefined);

  /* Loading flags */
  const [loadingJobs, setLoadingJobs] = useState(true);

  /* Modal */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | undefined>(undefined);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    "Desea eliminar el puesto de trabajo?"
  );
  const [modalVariant, setModalVariant] = useState<
    "error" | "success" | "warning"
  >("warning");

  /* Cargar datos al montar */
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoadingJobs(true);
    const data = await getJobs();

    setJobs(data);
    setLoadingJobs(false);
  };

  /* Cerrar modal */
  const handleClose = () => {
    setOpen(false);
    setEditing(undefined);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClickDelete = (job: any) => {
    setJobDelete(job);
    setModalMessage("Desea eliminar el puesto de trabajo" + job.name + " ?");
    setModalVariant("warning");
    setOpenModalConfirm(true);
  };

  async function handleDelete() {
    if (!jobDelete?.id) {
      return;
    }
    setModalMessage(
      "Desea eliminar el puesto de trabajo" + jobDelete.name + " ?"
    );
    setModalVariant("warning");
    // return;
    const res = await deleteJob(jobDelete.id);
    if (res.message) {
      setModalMessage(res.message || "Puesto de trabajo eliminado");
      setModalVariant("success");
      setOpenModalConfirm(true);
      loadJobs();
    } else {
      
      alert("Error al eliminar");
    }
  }

  return (
    <Grid2
      container
      justifyContent="center"
      alignItems="flex-start"
      width="100%"
      sx={{
        marginRight: "55px",
        bgcolor: "#f5f5f5",
      }}
    >
      <Grid2
        container
        size={{ xs: 6, sm: 10, md: 12, lg: 12, xl: 12 }}
        display="flex"
        justifyContent="center"
      >
        <Card
          sx={{
            borderRadius: "20px",
            boxShadow: 3,
            p: { xs: 1, sm: 2, md: 3 },
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box p={3}>
              <Box display={"flex"} justifyContent="space-between" mb={2}>
                <Box
                  display={"flex"}
                  alignItems="center"
                  id="jobs-title"
                  sx={{
                    fontSize: "1.25rem",
                    color: "#000",
                    marginLeft: "60px",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 600,
                      fontSize: "18px",
                    }}
                  >
                    Puestos de trabajo
                  </Typography>
                </Box>
                {/* Botón agregar */}
                <Box id="add-job-button">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ fontSize: "24px" }} />}
                    onClick={handleOpen}
                    sx={{
                      borderRadius: "20px",
                      backgroundColor: "#23FFDC",
                      color: "#002338",
                      fontSize: "20px",
                      fontWeight: 500,
                      textTransform: "none",
                      height: "50px",
                      fontFamily: "Poppins, sans-serif",
                      px: 3,
                      boxShadow: "none",
                      width: "100%",
                      "&:hover": {
                        backgroundColor: "#1be0e0",
                        boxShadow: "none",
                      },
                    }}
                  >
                    Agregar
                  </Button>
                </Box>
              </Box>

              {/* Tabla */}
              {loadingJobs ? (
                <CircularProgress size={24} />
              ) : (
                <TableContainer sx={{ maxHeight: 700, borderRadius: "20px" }}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        <TableCell
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
                          {"Nombre"}
                        </TableCell>
                        <TableCell
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
                          {"Descripción"}
                        </TableCell>
                        <TableCell
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
                          {"Activo"}
                        </TableCell>

                        <TableCell
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
                          {"Acciones"}
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {jobs.map((j) => (
                        <TableRow hover key={j.id}>
                          <TableCell align="center">{j.name}</TableCell>
                          <TableCell align="center">{j.description}</TableCell>
                          <TableCell align="center">
                            {j.status == true ? "Si" : "No"}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditing(j);
                                setOpen(true);
                              }}
                            >
                              <EditIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                handleClickDelete(j);
                              }}
                            >
                              <TrashIcon fontSize="inherit" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}

                      {!jobs.length && (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="body2" color="text.secondary">
                              No hay puestos de trabajo cargados.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Modal alta / edición */}
              <JobsModal
                open={open}
                onClose={handleClose}
                onSaved={loadJobs}
                editRecord={editing}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid2>
      <ModalComponent
        open={openModalConfirm}
        variant={modalVariant}
        message={modalMessage}
        onConfirm={() => {
          modalVariant == "warning" ? handleDelete() : null;
        }}
        onClose={() => setOpenModalConfirm(false)}
      />
    </Grid2>
  );
}
