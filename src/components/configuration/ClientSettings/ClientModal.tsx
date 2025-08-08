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
import { createClient, updateClient } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    editRecord?: any; // undefined = alta
}

const emptyForm = { name: "", description: "", status: "true" };

export default function ClientModal({
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
            ? await updateClient(editRecord.id, payload)
            : await createClient(payload);

        if (res.client) {
            setOpenModal(true);
            onSaved();
            onClose();
            
        } else {
            console.error("Error al guardar cliente:", res);
            alert("Error al guardar");
        }
    }

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontFamily: "Poppins" }}>
                    {editRecord ? "Editar Cliente" : "Nuevo Cliente"}
                </DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Nombre del Cliente"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            size="small"
                            fullWidth
                            sx={{
                                fontFamily: "Poppins",
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
                                fontFamily: "Poppins",
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
                                fontFamily: "Poppins",
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
                    <Button variant="outlined" onClick={onClose} sx={{ color: "#002338", border: "1px solid #002338", borderRadius: "20px" }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} sx={{ backgroundColor: "#002338", color: "#23FFDC", borderRadius: "20px" }}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
            <ModalComponent
                open={openModal}
                variant="success"
                message="Cliente guardado exitosamente"
                onClose={() => setOpenModal(false)}
            />
        </>
    );
}

