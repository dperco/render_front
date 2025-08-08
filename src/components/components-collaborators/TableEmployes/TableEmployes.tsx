import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  IconButton,
  Collapse,
  Typography,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, ExpandMore, Info } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Employee, ColumnConfigColaborador } from "@/types/interface";
import { useUser } from "@/app/UserContext";
import ModalComponent from "@/components/message/MessageModal";
import { removecollaborator, removeAssignedPerson } from "@/services/api";
import { formatDate } from "@/utils/utils";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import EmployeeActions from "@/components/components-collaborators/actions/page";
interface Props {
  searchTerm: string;
  collaboratorProp: Employee[];
}
const EmployeeTable: React.FC<Props & { columnsprop: ColumnConfigColaborador[] }> = ({
  searchTerm,
  collaboratorProp,
  columnsprop,
}) => {
  const { user } = useUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<Employee | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [columns, setColumns] = useState<ColumnConfigColaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [openTech, setOpenTech] = useState<Record<string, boolean>>({});
  const [openProj, setOpenProj] = useState<Record<string, boolean>>({});
  const [openRoles, setOpenRoles] = useState<Record<string, boolean>>({});
  const router = useRouter();
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
  useEffect(() => {
    if (user?.rol === "manager") {
      setIsAdmin(false);
    } else if (user?.rol === "administrador") {
      setIsAdmin(true);
    }
  }, [user]);

  useEffect(() => {
    setIsLoading(false);
    setColumns(columnsprop);
  }, [isAdmin, columnsprop]);

useEffect(() => {
  const hoy = new Date();
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const updatedEmployees = collaboratorProp
    .filter((employee: Employee) => !employee.delete_at)
    .filter((employee: Employee) => {
      if (!normalizedSearch) return true;
      const fullName = `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.toLowerCase();
      const email = (employee.email ?? "").toLowerCase();
      const tecnologias = (employee.tecnologias ?? []).join(" ").toLowerCase();
      const roles = (employee.roles ?? []).map(role => `${role.rol} ${role.seniority}`).join(" ").toLowerCase();
      return (
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        tecnologias.includes(normalizedSearch) ||
        roles.includes(normalizedSearch)
      );
    })
    .map((employee: Employee) => {
      // Cálculo de alerta de contrato

      let alertLevel: "warning" | "expired" | null = null;
      let contractMessage: string | null = null;
      let daysRemaining: number | null = null;

      if (employee.fin_contrato) {
        const fin = new Date(employee.fin_contrato);
        const diffDays = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          alertLevel = "expired";
          contractMessage = `Contrato expirado hace ${-diffDays} días`;
        } else if (diffDays <= 7) {
          alertLevel = "warning";
          contractMessage = `Quedan ${diffDays} días para fin de contrato`;
        }
      }

      return {
        ...employee,
        estado: employee.estado?.trim() || "",
        alertLevel,
        contractMessage,
      };
    });

  setEmployees(updatedEmployees);
}, [collaboratorProp, searchTerm]);



  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - (tableContainerRef.current?.offsetLeft || 0));
    setScrollLeft(tableContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (tableContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1;
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setEditedRow({ ...employees[index] });
  };

  const handleSave = async () => { };

  const handleDelete = async (collaboratorId: string) => {
    const empleado = employees.find(e => e.id === collaboratorId);
    if (!empleado) return;
    if (empleado.Proyectos?.length) {
      for (const proyecto of empleado.Proyectos) {
        const projId = typeof proyecto.projectId === "string"
          ? proyecto.projectId
          : proyecto.projectId?.id;
        if (projId) {
          try {
            await removeAssignedPerson(projId, collaboratorId);
          } catch (err) {
            showDialog("error", `No se pudo quitar del proyecto ${projId}`);
            return;
          }
        }
      }
    }
    try {
      const res = await removecollaborator(collaboratorId);
      if (res.status === "error") {
        showDialog("error", res.status || "Error al eliminar colaborador");
        return;
      }
      showDialog("success", "Colaborador eliminado correctamente");
      setEmployees(prev => prev.filter(e => e.id !== collaboratorId));
    } catch (err) {
      showDialog("error", "Ocurrió un error inesperado al eliminar");
    }
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

  const toggleTech = (id: number) =>
    setOpenTech((p) => ({ ...p, [id]: !p[id] }));

  const toggleProj = (id: number) =>
    setOpenProj((p) => ({ ...p, [id]: !p[id] }));
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
        <TableContainer
          component={Paper}
          ref={tableContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          sx={{ maxHeight: 700, borderRadius: "20px" }}
        >
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {isLoading ? (
                  <TableCell colSpan={9} align="center">
                    Cargando configuración...
                  </TableCell>
                ) : error ? (
                  <TableCell colSpan={9} align="center" style={{ color: "red" }}>
                    {error}
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
                        sx={{
                          backgroundColor: "#BDE0FF",
                          textAlign: "center",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                          fontSize: "16.16px",
                          color: "#000000DE",
                        }}
                      >
                        {column.displayName}
                      </TableCell>
                    ))}
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
              {employees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee, index) => (
                  <TableRow key={`${employee.dni}-${index}`}>
                    <TableCell align="center">
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                        
                      >
                        <Typography sx={{
                          Size: "16.16px",
                          fontFamily: "Roboto",
                          fontWeight: 400,
                          color: "#000000DE",
                          textAlign: "center",
                        }}>{employee.first_name}</Typography>

                        {employee.last_edited_by && employee.last_edited_on && (
                          <Tooltip
                            title={`Última modificación por ${employee.last_edited_by
                              } el ${new Date(
                                employee.last_edited_on
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

                        {employee.alertLevel && (
                          <Tooltip title={employee.contractMessage || ""}>
                            <IconButton size="small">
                              {employee.alertLevel === "expired" ? (
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
                    <TableCell align="center">
                      <Typography
                        sx={{
                          Size: "16.16px",
                          fontFamily: "Roboto",
                          fontWeight: 400,
                          color: "#000000DE",
                          textAlign: "center",
                        }}
                      >
                        {employee.last_name}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ p: 0, minWidth: "220px", maxWidth: "320px" }}
                    >
                      {employee.roles && employee.roles.length > 0 ? (
                        <Box>
                          <Box
                            display="flex"
                            alignItems="center"
                            sx={{
                              cursor:
                                employee.roles.length > 1 ? "pointer" : "default",
                            }}
                            justifyContent="center"
                            onClick={
                              employee.roles.length > 1
                                ? () =>
                                  setOpenRoles((prev) => ({
                                    ...prev,
                                    [employee.dni]: !prev[employee.dni],
                                  }))
                                : undefined
                            }
                          >
                            <Typography
                              sx={{
                                fontSize: "16.16px",
                                fontFamily: "Roboto",
                                fontWeight: 400,
                                color: "#000000DE",
                                textAlign: "center",
                              }}
                            >
                              {employee.roles[0].rol} -{" "}
                              {employee.roles[0].seniority}
                              {employee.roles.length > 1 && (
                                <ExpandMore
                                  sx={{
                                    ml: 0.5,
                                    transform: openRoles[employee.dni]
                                      ? "rotate(180deg)"
                                      : "none",
                                    transition: "transform .2s",
                                  }}
                                />
                              )}
                            </Typography>
                          </Box>
                          <Collapse in={openRoles[employee.dni]} unmountOnExit>
                            {employee.roles.slice(1).map((r, i) => (
                              <Typography
                                sx={{
                                  fontSize: "16.16px",
                                  fontFamily: "Roboto",
                                  fontWeight: 400,
                                  color: "#000000DE",
                                  textAlign: "center",
                                }}
                                key={i}
                              >
                                {r.rol} - {r.seniority}
                              </Typography>
                            ))}
                          </Collapse>
                        </Box>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ p: 0, minWidth: "220px", maxWidth: "320px" }}
                    >
                      {employee.Proyectos?.length ? (
                        <Box>
                          <Box
                            display="flex"
                            alignItems="center"
                            sx={{
                              cursor: "pointer",
                            }}
                            justifyContent="center"
                            onClick={() => toggleProj(employee.dni)}
                          >
                            <Typography
                              sx={{
                                fontSize: "16.16px",
                                fontFamily: "Roboto",
                                fontWeight: 400,
                                color: "#000000DE",
                                textAlign: "center",
                              }}
                            >
                              {typeof employee.Proyectos[0]?.projectId === "string"
                                ? employee.Proyectos[0]?.projectId
                                : employee.Proyectos[0]?.projectId?.name || "-"}
                              {Array.isArray(employee.Proyectos) &&
                                employee.Proyectos.length > 1 && (
                                  <ExpandMore
                                    sx={{
                                      ml: 0.5,
                                      transform: openProj[employee.dni]
                                        ? "rotate(180deg)"
                                        : "none",
                                      transition: "transform .2s",
                                    }}
                                  />
                                )}
                            </Typography>
                          </Box>

                          <Collapse in={openProj[employee.dni]} unmountOnExit>
                            {Array.isArray(employee.Proyectos) && employee.Proyectos.length > 0 ? (
                              employee.Proyectos
                                .filter(p => p.projectId && typeof p.projectId !== 'string')
                                .map((p, idx) => {
                                  if (p.projectId) {
                                    const { id, name } = p.projectId;
                                    return (
                                      <Typography
                                        sx={{
                                          Size: "16.16px",
                                          fontFamily: "Roboto",
                                          fontWeight: 400,
                                          color: "#000000DE",
                                          textAlign: "center",
                                        }}
                                        key={id}
                                      >
                                        {name}
                                      </Typography>
                                    );
                                  }
                                })
                            ) : (
                              <p>-</p>
                            )}
                          </Collapse>
                        </Box>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell align="center" sx={{ p: 0 }}>
                      {employee.tecnologias?.length ? (
                        <Box>
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            onClick={() => toggleTech(employee.dni)}
                            sx={{ cursor: "pointer" }}
                          >
                            <Typography
                              sx={{
                                fontSize: "16.16px",
                                fontFamily: "Roboto",
                                fontWeight: 400,
                                color: "#000000DE",
                                textAlign: "center",
                              }}
                            >
                              {employee.tecnologias[0]}
                              {Array.isArray(employee.tecnologias) &&
                                employee.tecnologias.length > 1 && (
                                  <ExpandMore
                                    sx={{
                                      ml: 0.5,
                                      transform: openTech[employee.dni]
                                        ? "rotate(180deg)"
                                        : "none",
                                      transition: "transform .2s",
                                    }}
                                  />
                                )}
                            </Typography>
                          </Box>

                          <Collapse in={openTech[employee.dni]} unmountOnExit>
                            {employee.tecnologias.slice(1).map((t) => (
                              <div key={t}>{t}</div>
                            ))}
                          </Collapse>
                        </Box>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        sx={{
                          Size: "16.16px",
                          fontFamily: "Roboto",
                          fontWeight: 400,
                          color: "#000000DE",
                          textAlign: "center",
                        }}
                      >
                        {employee.estado}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography
                        sx={{
                          fontSize: "16.16px",
                          fontFamily: "Roboto",
                          fontWeight: 400,
                          color: "#000000DE",
                          textAlign: "center",
                        }}

                      >
                        {employee.fin_contrato
                          ? formatDate(employee.fin_contrato)
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        sx={{
                          Size: "16.16px",
                          fontFamily: "Roboto",
                          fontWeight: 400,
                          color: "#000000DE",
                          textAlign: "center",
                        }}
                      >
                        {employee.horasAsignadas}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center">
                        <>
                          <IconButton
                            onClick={() => {
                              router.push(`/pages/edit/employe/${employee.id}`);
                            }}
                          >
                            {editIndex === index ? <Edit /> : <Edit />}
                          </IconButton>
                          <IconButton
                            onClick={() => {

                            }}
                          >
                            <VisibilityIcon fontSize="inherit" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(employee.id)}
                          >
                            <Delete />
                          </IconButton>

                        </>
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
          count={employees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </>
  );
};

export default EmployeeTable;
