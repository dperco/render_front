"use client";
import { Box, Typography, Card, Stack, Grid2 } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { AssignedPersons } from "@/types/interface";
import { removeAssignedPerson, updateAssignedPersonToProject, updateCollaboratorServiceedit, getColabById } from "@/services/api";
import React, { useState } from "react";
import ModalComponent from "@/components/message/MessageModal";

interface CollaboratorListProps {
  collaborator: AssignedPersons[];
  onDelete: (id: string) => void;
  projectId: string;
  onUpdateTime: (colabId: string, newHoras: number) => void;
}

export default function CollaboratorList({
  collaborator,
  onDelete,
  projectId,
  onUpdateTime,
}: CollaboratorListProps) {
  const [editing, setEditing] = useState<{ [projectId: string]: boolean }>({});
  const [horas, setHoras] = useState<{ [id: string]: number }>(
    Object.fromEntries(collaborator.map((c) => [c.id, c.horasAsignadas]))
  );

  React.useEffect(() => {
    setHoras(Object.fromEntries(collaborator.map((c) => [c.id, c.horasAsignadas])));
  }, [collaborator]);

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

  if (!collaborator.length) return null;

  const colaboradoresPorRol: { [rol: string]: AssignedPersons[] } = {};
  collaborator
    .filter((colab) => colab.rol.toLowerCase() !== "manager")
    .forEach((colab) => {
      if (!colaboradoresPorRol[colab.rol]) colaboradoresPorRol[colab.rol] = [];
      colaboradoresPorRol[colab.rol].push(colab);
    });

  const handleDelete = async (colabId: string) => {
    try {
      await removeAssignedPerson(projectId, colabId);
      onDelete(colabId);
      const colab = collaborator.find((c) => c.id === colabId);
      showDialog(
        "success",
        `Colaborador "${colab?.name ?? ""}" desvinculado correctamente.`
      );
    } catch (error: any) {
      showDialog(
        "error",
        error?.message || "No se pudo desvincular al colaborador. Intenta nuevamente."
      );
    }
  };

  const handleHorasChange = (id: string, value: string) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setHoras((prev) => ({ ...prev, [id]: num }));
    }
  };

  const handleHorasBlur = async (colab: AssignedPersons) => {
    setEditing((prev) => ({ ...prev, [colab.id]: false }));
    if (horas[colab.id] !== colab.horasAsignadas) {
      const oldAssigned = colab.horasAsignadas;
      const newAssigned = horas[colab.id];
      try {
        await updateAssignedPersonToProject(projectId, colab.id, {
          name: colab.name,
          rol: colab.rol,
          seniority: colab.seniority,
          tecnologias: colab.tecnologias,
          horasAsignadas: horas[colab.id],
        });
        onUpdateTime(colab.id, horas[colab.id]);
        const result = await actualizarHorasGlobales(colab.id, oldAssigned, newAssigned);
        if (result.status !== "success") {
          throw new Error(result.message || "Error al actualizar horas globales");
        }else {
          showDialog(
            "success",
            `Horas del colaborador "${colab.name}" actualizadas correctamente.`
          );
        }
      } catch (error: any) {
        showDialog(
          "error",
          error?.message || "No se pudo actualizar las horas. Intenta nuevamente."
        );
        setHoras((prev) => ({ ...prev, [colab.id]: colab.horasAsignadas }));
      }
    }
  };
  const actualizarHorasGlobales = async (
    collaboratorId: string,
    oldAssigned: number,
    newAssigned: number
  ) => {
    const result = await getColabById(collaboratorId);
    if (result.status == "success") {
      const currentGlobal = result.collaborator.horasAsignadas;
      const diff = newAssigned - oldAssigned;
      const updatedGlobal = currentGlobal + diff;
      return await updateCollaboratorServiceedit(collaboratorId, {
        horasAsignadas: updatedGlobal,
      });

    }


  }
  return (
    <Box>
      {Object.entries(colaboradoresPorRol).map(([rol, colaboradores]) => (
        <Box key={rol} sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "18px",
              color: "#1a73e8",
              mb: 1,
            }}
          >
            {rol}
          </Typography>
          <Grid2 container spacing={2} sx={{ mb: 2 }}>
            {colaboradores.map((v) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={v.id}>
                <Card
                  sx={{
                    p: 2,
                    minWidth: "289px",
                    maxWidth: "400px",
                    width: "100%",
                    height: "162px",
                    borderRadius: "10px",
                    bgcolor: "#CDCDCD",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Info label="Colaborador" value={v.name} />
                  <Info
                    label="Tecnología"
                    value={v.tecnologias.join(", ")}
                    multiline={true}
                  />
                  <Stack direction="row" gap={1} mb={"0.5px"} alignItems="center">
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "16px",
                        color: "#002338",
                      }}
                    >
                      Horas asignadas:
                    </Typography>
                    {editing[v.id] ? (
                      <input
                        type="number"
                        value={horas[v.id]}
                        min={0}
                        style={{
                          fontFamily: "Poppins",
                          fontWeight: 300,
                          fontSize: "16px",
                          color: "#002338",
                          width: "60px",
                        }}
                        autoFocus
                        onChange={(e) => handleHorasChange(v.id, e.target.value)}
                        onBlur={() => handleHorasBlur(v)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 300,
                          fontSize: "16px",
                          color: "#002338",
                        }}
                      >
                        {horas[v.id]}
                      </Typography>
                    )}
                  </Stack>
                  <Stack
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      right: 16,
                      zIndex: 2,
                      background: "transparent",
                    }}
                    direction="row"
                    alignItems={"center"}
                    justifyContent={"flex-end"}
                    gap={1}
                  >
                    {editing[v.id] ? (
                      <SaveIcon
                        sx={{
                          color: "#000",
                          fontSize: "24px",
                          cursor: "pointer",
                        }}
                        titleAccess="Guardar horas"
                        onClick={() => handleHorasBlur(v)}
                      />
                    ) : (
                      <EditIcon
                        sx={{
                          color: "#000",
                          fontSize: "24px",
                          cursor: "pointer",
                        }}
                        titleAccess="Editar horas"
                        onClick={() => setEditing((prev) => ({ ...prev, [v.id]: true }))}
                      />
                    )}
                    <DeleteIcon
                      fontSize="inherit"
                      sx={{
                        color: "#D61010",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleDelete(v.id)}
                    />
                  </Stack>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        </Box>
      ))}
      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </Box>
  );
}

function Info({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <Stack direction="row" gap={1} mb={"0.5px"}>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "16px",
          color: "#002338",
          flexShrink: 0,
        }}
      >
        {label}:
      </Typography>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 300,
          fontSize: "16px",
          color: "#002338",
          wordBreak: multiline ? "break-word" : "normal",
          overflow: "hidden",
          textOverflow: multiline ? "initial" : "ellipsis",
          whiteSpace: multiline ? "normal" : "nowrap",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
