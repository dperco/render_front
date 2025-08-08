import { Vacante, ColumnConfig, Notification, Reader } from "@/types/interface";
import { FieldDef } from "@/components/configuration/CollaboratorSettings/types";
import {
  Project,
  Employee,
  RegisterProjectBody,
  Vacancie,
  Tecnologia,
  AssignedPersons,
  Skill,
  ResponseGetColabById,
  GetClientResponse
} from "@/types/interface";

//----------------------------------COLABORADOR-------------------------------------

export const removeAssignedPerson = async (
  projectId: string,
  collaboratorId: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/assigned-persons`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: collaboratorId }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("❌ Error eliminando persona:", error);
    throw error;
  }
};
export async function updateCollaboratorServiceedit(id: string, body: any) {
  // NO incluimos _id en el payload: el servidor debe usar el :id de la URL
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/collaborator/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const text = await res.text();
  if (!res.ok) {
    // Si falla, levantamos el mensaje de error del servidor
    console.error("→ Cuerpo de la respuesta de error:", text);
    throw new Error(text);
  }

  return JSON.parse(text);
}
export async function addAssignedPersonToProject(
  projectId: string,
  person: {
    id: string;
    name: string;
    rol: string;
    seniority: string;
    tecnologias: string[];
    horasAsignadas: number;
  }
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/assigned-persons`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(person),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return res.json();
}
export async function updateAssignedPersonToProject(
  projectId: string,
  collaboratorId: string,
  fieldsToUpdate: {
    name?: string;
    rol?: string;
    seniority?: string;
    tecnologias?: string[];
    horasAsignadas?: number;
  }
) {
  const body = {
    id: collaboratorId,
    ...fieldsToUpdate,
  };
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/assignedPersons/${collaboratorId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return res.json();
}
export const fetchCollaborators = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/collaborator/`
    );
    if (!response.ok) throw new Error("Error al obtener los colaboradores");

    const data: Employee[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener los colaboradores:", error);
  }
};
export async function removecollaborator(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/collaborator/${id}`,
    {
      method: "DELETE",
    }
  );
  return handleResponse<{ status: string }>(res);
}
export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Error subiendo imagen: " + err);
  }
  const { imageKey } = await res.json();
  return imageKey;  // TS inferirá que esto es Promise<string>
}

export async function getImageUrl(imageKey: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/upload/image/${imageKey}`
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Error obteniendo URL: " + err);
  }
  const { url } = await res.json();
  return url;  // TS inferirá Promise<string>
}

//--------------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export const fetchProjects = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/`
    );
    if (!response.ok) throw new Error("Error al obtener los datos");

    const result = await response.json();

    const proyectosActivos = result.data.filter(
      (proyecto: Project) => !proyecto.delete_at
    );

    return proyectosActivos;
  } catch (error) {
    console.error("Error al obtener los proyectos:", error);
    return [];
  }
};

export const fetchVacancies = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/vacancie/`
    );
    if (!response.ok) throw new Error("Error al obtener los datos");
    const data: Vacante[] = await response.json();
    const vacantesActivas = data.filter((vacante) => !vacante.delete_at);
    return vacantesActivas;
  } catch (error) {
    console.error("Error al cargar las vacantes:", error);
  }
};

export const fetchVacancie = async (id: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/vacancie/${id}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) throw new Error("Error al obtener los datos");
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error al cargar las vacantes:", error);
  }
};

export async function getColumns(entity: string): Promise<ColumnConfig[]> {
  const res = await fetch(`${API_URL}/configuration/columns/${entity}`);
  const data = await handleResponse<{ columns: ColumnConfig[] }>(res);
  return data.columns.sort((a, b) => a.order - b.order);
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/user/prueba`);
  return handleResponse<any[]>(res);
}

export async function updateUser(email: string, payload: any) {
  const response = await fetch(`${API_URL}/user/update/${email}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar usuario');
  }

  const data = await response.json();
  return data;
}

export async function eliminarUsuarioPorEmail(email: string) {
  const response = await fetch(`${API_URL}/user/delete/${email}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar usuario');
  }

  const data = await response.json();
  return data;
}



export async function getVacancies(search: string): Promise<Vacante[]> {
  const url = `${API_URL}/vacancie/?search=${encodeURIComponent(search)}`;
  const res = await fetch(url);
  const data = await handleResponse<Vacante[]>(res);
  return data.filter((v) => !v.delete_at);
}

export async function editVacancy(id: string, payload: Partial<Vacancie>) {
  const res = await fetch(`${API_URL}/vacancie/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ vacancie: Vacancie; status: string }>(res);
}

export async function deleteVacancy(id: string) {
  const res = await fetch(`${API_URL}/vacancie/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ status: string }>(res);
}

export const getColabById = async (id: string): Promise<ResponseGetColabById> => {
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/collaborator/${id}`,
    {
      method: "GET",
    }
  );
  if (!res.ok) {
    throw new Error(`Error ${res.status} al obtener colaborador ${id}`);
  }
  // aquí ya viene un único objeto, no array
  const data: ResponseGetColabById = await res.json();
  return data;
};

export const fetchAddColab = async (payload: any) => {
  try {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/collaborator/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = await resp.json();
    return result;
  } catch (error) {
    console.error("Error al agregar colaborador:", error);
  }
};

export const fetchTecnology = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/technology/tecnology`
    );
    if (!response.ok)
      throw new Error("Error en la carga de datos desde la API");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar los datos:", error);
  }
};

export const fetchTableColumns = async (entity: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/configuration/columns/${entity}`
  );

  if (!response.ok) {
    throw new Error(
      `Error al obtener columnas de "${entity}": ${response.status}`
    );
  }

  const data = await response.json();
  const columnsData = data.columns || [];

  const sortedColumns = [...columnsData].sort((a, b) => a.order - b.order);
  return sortedColumns;
};

export const fetchProjectById = async (id: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`
    );
    if (!response.ok) throw new Error("Error al obtener el proyecto");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener el proyecto:", error);
  }
};

export const fetchDeleteProjectById = async (id: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
      {
        method: "POST",
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error("Error de conexión al backend:" + error);
  }
};

export async function editProject(id: string, payload: Partial<Project>) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<{ project: Project; status: string }>(response);
}

export async function registerVacanteService(body: any) {
  const payload = { ...body };
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vacancie/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`400 Bad Request:`, text);
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

export async function updateCollaboratorService(id: string, body: any) {
  const payload = { ...body, id };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/collaborator/${id}/asignar`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const text = await res.text();
  if (!res.ok) {
    console.error("→ Cuerpo de la respuesta de error:", text);
    throw new Error(text);
  }

  return JSON.parse(text);
}

export async function registerProjectService(
  body: RegisterProjectBody
): Promise<Project> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    const msg = data.missingFields
      ? `Faltan campos: ${data.missingFields.join(", ")}`
      : data.message || res.statusText;
    throw new Error(msg);
  }
  return data.project as Project;
}
export async function fetchAvailableTechnologies(): Promise<string[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/technology/tecnology`
  );
  if (!res.ok) {
    const txt = await res.text();
    console.error("Error al fetch de tecnologías:", txt);
    throw new Error("Error en la carga de tecnologías");
  }
  const data: any[] = await res.json();

  // Unificamos y limpiamos la lista
  const techSet = new Set<string>();
  data.forEach((item) => {
    item.tecnologias
      ?.split(";")
      .map((t: any) => t.trim())
      .filter(Boolean)
      .forEach((t: any) => techSet.add(t));
  });

  return Array.from(techSet);
}

export const fetchManagers = () =>
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/prueba`)
    .then((res) => {
      if (!res.ok) throw new Error("Error al cargar usuarios");
      return res.json() as Promise<any[]>;
    })
    .then((users) =>
      users
        .filter((u) => {
          const rol = u.rol || u.role || u.Rol || u.Role;
          return (
            rol === "manager" ||
            rol === "Manager" ||
            (Array.isArray(rol) &&
              rol.some((r) => r.toLowerCase() === "manager"))
          );
        })
        .map((u) => ({
          manager_id: u.id || u._id || "",
          // managerName:
          //   `${u.first_name || u.nombre || u.name || ""} ${
          //     u.last_name || u.apellido || ""
          //   }`.trim() || "Manager sin nombre",
          manager_name:
            `${u.first_name || u.nombre || u.name || ""} ${u.last_name || u.apellido || ""
              }`.trim() || "Manager sin nombre",
        }))
    );


export async function fetchManager() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/collaborator/`
    );
    if (!response.ok) throw new Error("Error al obtener los colaboradores");

    const data: Employee[] = await response.json();

    const managers = data.filter((colab) =>
      Array.isArray(colab.roles) &&
      colab.roles.some((r) => {
        const rolLower = r.rol?.toLowerCase();
        return rolLower === "manager" || rolLower === "project manager";
      })
    );

    return managers;
  } catch (error) {
    console.error("Error al obtener los colaboradores:", error);
  }
}
export async function getBasicFields() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/basic-fields`);
  return res.json();
}

export async function getExtraFields() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extra-fields`);
  return res.json();
}

export async function deleteExtraField(id: string) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/extra-fields/${id}`, {
    method: "DELETE",
  });
}

export async function getPersonnel() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personnel`);
  return res.json();
}

export async function createExtraField(payload: Partial<FieldDef>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extra-fields`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res;
}

export async function updateExtraField(id: string, payload: Partial<FieldDef>) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/extra-fields/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  return res;
}

export async function createPersonnel(payload: any) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/personnel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updatePersonnel(id: string, payload: any) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/personnel/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export const getAllNotifications = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notification/all`
    );
    if (!response.ok)
      throw new Error("Error en la carga de datos desde la API");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar los datos:", error);
  }
};

export const getNotificationsOrdered = async (
  order: "newest" | "oldest" = "newest"
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/notification/ordered?order=${order}`
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const getNotificationsByManager = async (emails: string[]) => {
  const params = new URLSearchParams();
  params.append("emails", emails.join(","));

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL
    }/notification/byManager?${params.toString()}`
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const getNotificationsByUser = async (email: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notification/byUser/${email}`
    );

    if (!response.ok) throw new Error("Error al filtrar notificaciones");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al filtrar notificaciones:", error);
  }
};
export const markNotificationAsRead = async (
  email: string,
  referenceId: string,
  type: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/notification/markAsRead`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, referenceId, type }),
    }
  );
  if (!response.ok) throw new Error("Error al marcar como leída");
  return await response.json();
};
export const markAllNotificationsAsRead = async (email: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/notification/markAllAsRead`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );
  if (!response.ok) throw new Error("Error al marcar todas como leídas");
  return await response.json();
};

export const checkProjectExpiration = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notification/notiProjects`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) throw new Error("Error al verificar la expiración");

    return data;
  } catch (error) {
    console.error("Error al verificar la expiración del proyecto:", error);
  }
};

export const checkContractExpiration = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notification/notiContracts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) throw new Error("Error al verificar la expiración");

    return data;
  } catch (error) {
    console.error("Error al verificar la expiración del proyecto:", error);
  }
};

export const addAssignedPerson = async (projectId: string, person: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/assigned-persons`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(person),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const updateAssignedPerson = async (
  projectId: string,
  collaboratorId: string,
   fieldsToUpdate: {
    horasAsignadas?: number;
  }
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/assignedPersons/${collaboratorId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: collaboratorId, ...fieldsToUpdate }),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const removeProyectoFromColaborador = async (
  id: string,
  projectId: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/collaborator/${id}/proyectos`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const getAllTechnologies = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/technologies/`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const fetchProjectStates = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/stateprojects/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) throw new Error("Error al verificar la expiración");

    return data;
  } catch (error) {
    console.error("Error al verificar la expiración del proyecto:", error);
  }
};
export async function updateCollaboratorAfterProjectDeletion(
  collaboratorId: string,
  updatedData: any
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/collaborator/${collaboratorId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error actualizando colaborador:", error);
    return { status: "error", error };
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    if (!response.ok) throw new Error("Error al iniciar sesión");
    return response.json();
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
};

export const recoverPassword = async (email: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/auth/editpws`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );
    if (!response.ok) throw new Error("Error al recuperar la contraseña");
    return response.json();
  } catch (error) {
    console.error("Error al recuperar la contraseña:", error);
  }
};

export async function fetchTechnologies(): Promise<Skill[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/technologies/`);
  if (!res.ok) throw new Error(`fetchTechnologies: ${res.statusText}`);
  const payload = await res.json();
  return Array.isArray(payload) ? payload : payload.data;
}

export const resetPassword = async (
  email: string,
  newPassword: string,
  confirmPassword: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/auth/resetpassword`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, confirmPassword }),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const getJobs = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export async function createJob(payload: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export async function updateJob(id: string, payload: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/roles/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export async function deleteJob(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/roles/${id}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export const getClient = async ():Promise<GetClientResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  const data:GetClientResponse = await response.json()

  return data;
};
export async function createClient(payload: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export async function updateClient(id: string, payload: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/client/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export async function deleteClient(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/client/${id}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export async function recommendTeam(payload: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ia/recommend-team`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}



export async function metricsDashboard() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/metrics`
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export const getSkills = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export async function createSkill(payload: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export async function updateSkill(id: string, payload: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/skills/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export async function deleteSkill(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/skills/${id}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}
