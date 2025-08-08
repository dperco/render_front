import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Autocomplete,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { AssignedPersons, Employee } from "@/types/interface";
import { fetchCollaborators } from "@/services/api";
import SearchIcon from "@mui/icons-material/Search";
import { addAssignedPersonToProject } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";
import type { SelectChangeEvent } from "@mui/material";

interface AddNewPersonProps {
  onAddColaborador: (colaborador: AssignedPersons) => void;
  projectId: string;
}

export default function AddNewPerson({
  onAddColaborador,
  projectId,
}: AddNewPersonProps) {
  const [colaborador, setColaborador] = useState<AssignedPersons>({
    name: "",
    id: "",
    rol: "",
    horasAsignadas: 0,
    tecnologias: [],
    seniority: "",
  });
  const [loadingColab, setLoadingColab] = useState(false);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [allCollaborators, setAllCollaborators] = useState<AssignedPersons[]>(
    []
  );
  const [availableRoles, setAvailableRoles] = useState<
    {
      rol: string;
      seniority: string;
    }[]
  >([]);
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

  useEffect(() => {
    fetchCollaborators().then((res) => {
      setAllEmployees(res ?? []);
      setAllCollaborators(
        (res ?? []).map((emp: Employee) => ({
          name: `${emp.first_name} ${emp.last_name}`,
          id: emp.id,
          rol: emp.roles && emp.roles.length === 1 ? emp.roles[0].rol : "",
          seniority:
            emp.roles && emp.roles.length === 1 ? emp.roles[0].seniority : "",
          horasAsignadas: 0,
          tecnologias: emp.tecnologias || [],
        }))
      );
    });
  }, []);

  const handleSelectColaborador = (_: any, value: Employee | null) => {
    setSelectedEmployee(value);
    if (value) {
      const roles = value.roles ?? [];
      setAvailableRoles(roles);

      let rol = "";
      let seniority = "";
      if (roles.length === 1) {
        rol = roles[0].rol;
        seniority = roles[0].seniority;
      }

      setColaborador({
        name: `${value.first_name} ${value.last_name}`,
        id: value.id,
        rol,
        seniority,
        horasAsignadas: 0,
        tecnologias: value.tecnologias || [],
      });
    } else {
      setAvailableRoles([]);
      setColaborador({
        name: "",
        id: "",
        rol: "",
        horasAsignadas: 0,
        tecnologias: [],
        seniority: "",
      });
    }
  };

  const handleColabChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setColaborador((prev) => ({
      ...prev,
      [name as string]:
        name === "horasAsignadas"
          ? value === "" ? 0 : Number(value)
          : value,
    }));
  };

  const handleTechChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setColaborador((prev) => ({
      ...prev,
      tecnologias: [e.target.value as string],
    }));
  };

  const handleRolChange = (e: SelectChangeEvent<string>) => {
    const selectedRol = e.target.value as string;
    const selected = availableRoles.find((r) => r.rol === selectedRol);
    setColaborador((prev) => ({
      ...prev,
      rol: selectedRol,
      seniority: selected?.seniority || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingColab(true);
    try {
      const response = await addAssignedPersonToProject(projectId, {
        name: colaborador.name,
        id: colaborador.id,
        rol: colaborador.rol,
        horasAsignadas: Number(colaborador.horasAsignadas) || 0,
        tecnologias: colaborador.tecnologias,
        seniority: colaborador.seniority,
      });

      if (!response || response.status !== "success") {
        showDialog(
          "error",
          response?.message || "No se pudo agregar al colaborador. Intenta nuevamente."
        );
        return;
      }

      onAddColaborador(colaborador);
      setColaborador({
        name: "",
        id: "",
        rol: "",
        horasAsignadas: 0,
        tecnologias: [],
        seniority: "",
      });
      setAvailableRoles([]);
      showDialog(
        "success",
        `Colaborador "${colaborador.name}" agregado correctamente.`
      );
    } catch (error) {
      showDialog(
        "error",
        "No se pudo agregar al colaborador. Intenta nuevamente."
      );
    } finally {
      setLoadingColab(false);
    }
  };

  const fieldStyles = {
    height: "40px",
    width: "382px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "20px",
      "& fieldset": {
        borderColor: "#002338",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "black" },
  };

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  return (
    <Box sx={{ p: 2, bgcolor: "#EDEDED" }}>
      <form onSubmit={handleSubmit}>
        <Grid container alignItems="flex-start" sx={{ gap: "20px" }}>
          <Grid item>
            <Autocomplete
              options={allEmployees}
              getOptionLabel={(option) =>
                `${option.first_name} ${option.last_name}`
              }
              onChange={handleSelectColaborador}
              popupIcon={null}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="name"
                  label="Colaborador"
                  placeholder="Buscar colaborador"
                  value={colaborador.name}
                  size="small"
                  required
                  sx={{
                    height: "40px",
                    width: "382px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                      "& fieldset": {
                        borderColor: "#002338",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon sx={{ color: "#002338", mr: 2 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item>
            {availableRoles.length > 1 ? (
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
                fullWidth
              >
                <InputLabel>Rol</InputLabel>
                <Select
                  name="rol"
                  value={colaborador.rol}
                  onChange={handleRolChange}
                  required
                  input={<OutlinedInput label="Rol *" />}
                >
                  {availableRoles.map((r) => (
                    <MenuItem key={r.rol} value={r.rol}>
                      {r.rol}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="Rol"
                name="rol"
                value={colaborador.rol}
                size="small"
                required
                InputProps={{ readOnly: true }}
                sx={fieldStyles}
              />
            )}
          </Grid>

          <Grid item>
            <TextField
              label="Seniority"
              name="seniority"
              value={colaborador.seniority}
              size="small"
              required
              InputProps={{ readOnly: true }}
              sx={fieldStyles}
            />
          </Grid>

          <Grid item>
            <FormControl sx={{
              height: "40px",
              width: "382px",
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
              <InputLabel>Tecnologías</InputLabel>
              <Select
                name="tecnologias"
                multiple
                value={colaborador.tecnologias}
                onChange={(e) =>
                  setColaborador((prev) => ({
                    ...prev,
                    tecnologias:
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value,
                  }))
                }
                input={<OutlinedInput label="Tecnologías" />}
                displayEmpty
                required
                disabled={
                  !colaborador.id ||
                  !allCollaborators.find((c) => c.id === colaborador.id)
                    ?.tecnologias?.length
                }
                renderValue={(selected) =>
                  Array.isArray(selected) ? selected.join(", ") : ""
                }
              >
                {(
                  allCollaborators.find((c) => c.id === colaborador.id)
                    ?.tecnologias || []
                ).map((tech) => (
                  <MenuItem key={tech} value={tech}>
                    {tech}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <TextField
              label="Horas Asignadas"
              name="horasAsignadas"
              placeholder="Horas asignadas"
              value={colaborador.horasAsignadas}
              onChange={e =>
                setColaborador(prev => ({
                  ...prev,
                  horasAsignadas: Number(e.target.value) || 0,
                }))
              }
              size="small"
              required
              type="number"
              sx={fieldStyles}
            />
          </Grid>
        </Grid>

        <Grid
          item
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={loadingColab}
            sx={{
              width: "200px",
              bgcolor: "#002851",
              color: "#23FFDC",
              borderRadius: "20px",
              height: "50px",
              textTransform: "none",
              padding: "13px 41px",
              fontWeight: "medium",
              fontSize: "20px",
              fontFamily: "Poppins, sans-serif",
              "&:hover": { bgcolor: "#001c3d" },
            }}
          >
            {loadingColab ? "..." : "Guardar"}
          </Button>
        </Grid>
      </form>
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
