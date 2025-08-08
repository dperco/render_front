"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  TextField,
  Box,
  Tooltip,
  Typography,
} from "@mui/material";
import { Edit, Save, Delete, Info } from "@mui/icons-material";
import { Vacancie } from "@/types/interface";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useColumns } from "@/app/hooks/useColumns";
import { deleteVacancy } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";


interface Props {
  searchTerm: string;
  vacanciesProp: Vacancie[];
}

export default function VacanciesTable({ searchTerm, vacanciesProp }: Props) {
  const { isAdmin, currentUser } = useAuthRole();
  const {
    columns,
    loading: loadingColumns,
    error: errorColumns,
  } = useColumns("vacante");

  const [vacancies, setVacancies] = useState<Vacancie[]>(
    vacanciesProp.map(v => normalizeVacante(v))
  );
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
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

  function normalizeVacante(v: any) {
    return {
      ...v,
      Nombre: v.Nombre ?? "",
      Vacante: v.Vacante?.trim() || "Vacante sin nombre",
      manager_name: v.manager_name ?? "",
      Seniority: v.Seniority ?? "Sin especificar",
      "Fecha de pedido": v["Fecha de pedido"] ?? "",
      "Fecha de inicio": v["Fecha de inicio"] ?? "",
    };
  }

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setVacancies(vacanciesProp.map(v => normalizeVacante(v)));
      return;
    }

    const filtered = vacanciesProp.filter(v =>
      v.vacancieName.trim().toLowerCase().includes(searchTerm.toLowerCase())
    );

    setVacancies(filtered.map(v => normalizeVacante(v)));
  }, [searchTerm, vacanciesProp]);


  const handleDelete = async (id: string) => {
    await deleteVacancy(id);
    setVacancies(vacancies.filter(v => v.id !== id));
    setDialog({
      open: true,
      variant: "success",
      message: "La vacante se eliminó correctamente",
    });
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

  const paginated = vacancies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
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
            {vacancies
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((vacancies, index) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={vacancies.id}
                >
                  <TableCell align="center">{vacancies.vacancieName}</TableCell>

                  <TableCell align="center">
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                    >
                      <span>{vacancies.manager_name}</span>

                      {vacancies.last_edited_by && vacancies.last_edited_on && (
                        <Tooltip
                          title={`Última modificación por ${vacancies.last_edited_by
                            } el ${new Date(
                              vacancies.last_edited_on
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

                    </Box>
                  </TableCell>

                  <TableCell align="center">{vacancies.time}</TableCell>
                   <TableCell align="center">{vacancies.projectId?.name}</TableCell>
                  <TableCell align="center">{vacancies.seniority}</TableCell>

                  <TableCell align="center">
                    {vacancies.orderDate
                      ? new Date(vacancies.orderDate).toLocaleDateString()
                      : ""}
                  </TableCell>

                  <TableCell align="center">
                    {vacancies.startDate
                      ? new Date(vacancies.startDate).toLocaleDateString()
                      : ""}
                  </TableCell>

                  <TableCell align="center">
                    <Box display="flex" justifyContent="center">
                      {isAdmin || vacancies.manager_name === currentUser ? (
                        <>
                          <IconButton
                            onClick={() => {
                              router.push(
                                `/pages/edit/vacancie/${vacancies.id}`
                              );
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(vacancies.id)}
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
        count={vacancies.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </Paper>
  );
}
