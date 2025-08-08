"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import { createSkill, updateSkill } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editRecord?: any; // undefined = alta
}

const emptyForm = { name: "", description: "", status: "true" };

export default function JobsModal({
  open,
  onClose,
  onSaved,
  editRecord,
}: Props) {
  /* estado local */
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [openModal, setOpenModal] = useState(false);

  /* sincroniza al abrir o cambiar registro */
  useEffect(() => {
    if (open) {
      setForm(
        editRecord
          ? { ...editRecord, ...(editRecord.extraData ?? {}) }
          : emptyForm
      );
    }
  }, [open, editRecord]);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    set(name, value);
  };

  /* guardar */
  async function handleSave() {
    const payload = {
      name: form.name,
      description: form.description,
      status: form.status ? true : false,
    };

    const res = editRecord
      ? await updateSkill(editRecord.id, payload)
      : await createSkill(payload);
    
    if (res.skill) {
      setOpenModal(true);
      onSaved();
      onClose();
    } else {
      alert("Error al guardar");
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editRecord ? "Editar skill" : "Nueva skill"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre de la skill"
              name="name"
              value={form.name}
              onChange={handleChange}
              size="small"
              fullWidth
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
              InputProps={{
                sx: {
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  pl: "18px",
                },
              }}
            />

            <TextField
              multiline
              maxRows={6}
              label="Descripción"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  "& fieldset": {
                    borderColor: "#002338",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }}
              InputProps={{
                sx: {
                  display: "flex",
                  alignItems: "center",
                  pl: "18px",
                },
              }}
            />

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
              <InputLabel id="estado-label">Activo</InputLabel>
              <Select
                name="status"
                value={"status" in form ? String(form.status) : ""}
                onChange={(e) => set("status", e.target.value === "true")}
                size="small"
              >
                <MenuItem value="true">Si</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      <ModalComponent
        open={openModal}
        variant="success"
        message="Skill guardada exitosamente"
        onClose={() => setOpenModal(false)}
      />
    </>
  );
}

