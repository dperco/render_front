import { Grid, TextField, FormControl, InputLabel, MenuItem, Button, Box, Typography, OutlinedInput } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  RegisterProjectBody,
  Employee,
  Manager,
  Client
} from "@/types/interface";

interface EstadoProyecto {
  id: string | number;
  status?: string;
}



interface ProjectFormFieldsProps {
  formData: {
    name: string;
    client: string;
    status: string;
    managerName: string;
    startDate: string;
    endDate: string;
    category: string;
    budget: number | string;
    description: string;
    [key: string]: any;
  };
  tempImageUrl: string;
  fieldErrors: { [key: string]: string | boolean };
  estadosProyecto: EstadoProyecto[];
  managers: Manager[];
  clients: Client[];
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (event: SelectChangeEvent<string>) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProjectFormFields({
  formData,
  fieldErrors,
  estadosProyecto,
  managers,
  clients,
  handleChange,
  tempImageUrl,
  handleSelectChange,
  handleFileUpload,
}: ProjectFormFieldsProps) {
  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
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
            size="small"
            label="Nombre"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            error={fieldErrors["name"] === true}
            helperText={fieldErrors["name"]}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
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
            error={fieldErrors["client"] === true}
          >
            <InputLabel id="cliente-label">Cliente</InputLabel>
            <Select
              labelId="cliente-label"
              name="client"
              id="client"
              value={formData.client}
              onChange={handleSelectChange}
              input={<OutlinedInput label="Cliente" />}
            >
              {clients.length > 0 ? (
                clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  Cargando clientes...
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
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
            error={fieldErrors["status"] === true}
          >
            <InputLabel id="estado-label">Estado</InputLabel>
            <Select
              labelId="estado-label"
              name="status"
              id="status"
              value={formData.status}
              onChange={handleSelectChange}
              input={<OutlinedInput label="Estado" />}
            >
              {estadosProyecto.length > 0 ? (
                estadosProyecto.map((estado) => (
                  <MenuItem
                    key={estado.id}
                    value={estado.status || estado.id}
                  >
                    {estado.status || estado.id}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  Cargando estados...
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
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
            error={fieldErrors["managerName"] === true}
          >
            <InputLabel id="manager-label">Manager</InputLabel>
            <Select
              labelId="manager-label"
              name="managerName"
              id="managerName"
              value={formData.managerName || ""}
              onChange={handleSelectChange}
              input={<OutlinedInput label="Manager" />}
            >
              {managers && managers.length > 0 ? (
                managers.map((manager) => (
                  <MenuItem
                    key={manager.manager_id || Math.random().toString()}
                    value={manager.manager_name}
                  >
                    {manager.manager_name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  No hay managers disponibles
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
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
            size="small"
            label="Fecha de Inicio"
            name="startDate"
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={fieldErrors["startDate"] === true}
          // helperText={
          //   fieldErrors["startDate"] ? "Este campo es obligatorio" : ""
          // }
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
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
            size="small"
            label="Fecha de Fin"
            name="endDate"
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={fieldErrors["endDate"] === true}
          // helperText={
          //   fieldErrors["endDate"] ? "Este campo es obligatorio" : ""
          // }
          />
        </Grid>
        <Grid item xs={12} sm={4}>
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
            error={fieldErrors["category"] === true}

          >
            <InputLabel id="category-label">Categoría</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              id="category"
              value={formData.category}
              onChange={handleSelectChange}
              input={<OutlinedInput label="Categoría" />}
            >
              <MenuItem value="Gobierno">Gobierno</MenuItem>
              <MenuItem value="Privado">Privado</MenuItem>
              <MenuItem value="Inversion">Inversión</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
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
            size="small"
            label="Presupuesto"
            name="budget"
            id="budget"
            type="number"
            value={formData.budget}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            fullWidth

            error={fieldErrors["budget"] === true}
          />
        </Grid>
        <Box display="flex" alignItems="center" sx={{ ml: 1.5 }}>
          <Box>
            <Button
              component="label"
              sx={{
                color: "#0087FF",
                textTransform: "none",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              <CloudUploadIcon
                sx={{ mr: 1, width: "24px", height: "24px" }}
              />
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                Subir imagen de proyecto
              </Typography>
              <input
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontFamily: "Poppins",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            (Imagen de 160 x 160 píxeles. Solo formato png o jpeg)
          </Typography>
          <Box
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#fff",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #e0e4e7",
              marginLeft: "80px",
            }}
          >
            <img
              src={tempImageUrl ? tempImageUrl : "/images/anonimo.jpeg"}
              alt="Logo"
              style={{ maxWidth: "80%", maxHeight: "80%" }}
            />
          </Box>
        </Box>
        <Grid item xs={12}>
          <TextField
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
            size="small"
            label="Descripcion"
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
      </Grid>
    </>
  );
}
