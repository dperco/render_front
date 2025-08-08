//interfaces para la busqueda
export interface CardProps {
  searchTerm: string;
}
////////////////////////////
//interfaz para obtener las columnas
export interface ColumnConfig {
  displayName: string;
  field: keyof Vacante;
  order: number;
  isAction: boolean;
}
export interface ColumnConfigColaborador {
  displayName: string;
  field: string;
  order: number;
  isAction: boolean;
}
////////////////////////////////7
//Interfaces para la notificacion//
export interface Reader {
  email: string;
  readAt: Date | null;
  _id: string;
}
export interface Notification {
  _id: string;
  message: string;
  type: "contract" | "project";
  alertLevel: "warning" | "expired";
  referenceId: string;
  readers: Reader[];
  sentAt: Date;
}
//interfaces para los componentes de vacante
export interface Vacante {
  id: number;
  manager_id: string | null;
  manager_name: string;
  Nombre: string;
  Vacante: string;
  Tiempo: number;
  fecha_de_pedido: string;
  fecha_de_inicio: string;
  Seniority: string;
  created_at: string;
  delete_at: string;
  manager_visible_in_org_chart: boolean;
  last_edited_by: string;
  last_edited_on: string;
}

export interface Vacancie {
  id: string;
  manager_id: string | null;
  manager_name: string;
 projectId: {
    id: string;
    name: string;
  };
  vacancieName: string;
  time: number;
  orderDate: string;
  startDate: string;
  seniority: string;
  manager_visible_in_org_chart: boolean;
  last_edited_by: string;
  last_edited_on: string;
  created_at: string;
  delete_at: string;
  skills: Skill[];
}


export interface VacanteConPorcentaje {
  Vacante: string;
  delete_at: string;
  cantidad: number;
  porcentaje: number;
}
/////////////////////////////////////////////////
//interfaces para los componentes de colaboradores
export interface projectCollaborator {
  rol: string;
  projectId: {
    id: string;
    name: string;
  };
  tecnologias: string;
  horasAsignadas: number;
  seniority: string;
}
export interface RolSeniorityInfo {
  rol: string;
  seniority: string;
}
export interface Employee {
  contractStatus?: {
    daysRemaining: number | null;
    alertLevel: "warning" | "expired" | "on_time" | null;
    message?: string | null;
  },
  id: string;
  dni: number;
  first_name: string;
  last_name: string;
  email: string;
  Proyectos: projectCollaborator[];
  PuestoDeTrabajo: string;
  tecnologias: string[];
  honorarios: number;
  estado: string;
  HorasAsignadas: string;
  delete_at: Date | null;
  created_at: Date | null;
  observacion: number;
  roles: RolSeniorityInfo[];
  horasAsignadas: number;
  fin_contrato: Date | null;
  start_contrato: Date | null;
  last_edited_by: string;
  last_edited_on: string;
  first_nameS: string;
  last_nameS: string;
  alertLevel: "warning" | "expired" | null;
  contractMessage: string | null;
  daysRemaining: number | null;
  image: string | null;
  orderDate: string;
  startDate: string;
}
export interface ResponseGetColabById {
  collaborator: Employee;
  status: string;
}

//////////////////////////////
//interfaces para los componentes de proyectos
export interface AssignedPersons {
  horasAsignadas: number;
  id: string;
  name: string;
  rol: string;
  seniority: string;
  tecnologias: string[];
}

export interface ProjectNew {
  assignedPersons: AssignedPersons[];
  client: string | null;
  contractStatus?: {
    daysRemaining: number | null;
    alertLevel: "warning" | "expired" | "on_time" | null;
    message?: string | null;
  },
  created_at?: string;
  delete_at?: string | null;
  description: string | null;
  endDate: string | null;
  image: string | null;
  id: string;
  last_edited_on: string;
  last_edited_by: string;
  managerId: string | null;
  managerName: string | null;
  managerVisibleInOrgChart?: boolean;
  name: string;
  phase: string | null;
  projectType: string | null;
  startDate: string | null;
  status: string | null;
  taxonId?: number;
  category: "Gobierno" | "Privado" | "Inversion" | null;
  budget: number | null;
}

// 
export interface Project {
  id: string;
  taxonId: number;
  name: string;
  client: string;
  managerId: string;
  managerName: string;
  image: string;
  status: string;
  phase: string;
  projectType: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string;
  assignedPersons: AssignedPersons[];
  delete_at?: string;
  last_edited_by: string;
  last_edited_on: string;
  alertLevel: "warning" | "expired" | null;
  contractMessage: string | null;
  daysRemaining: number | null;
  category: "Gobierno" | "Privado" | "Inversion" | null;
  budget: number | null;
}

export interface ManagerPerson {
  manager_name: string;
  manager_id: string;
}
////////////////////////////////////////

//interfaces para los componentes de tecnologias//
export interface TechnologyCount {
  tecnologias: string;
  cantidad: number;
  personas: { first_name: string; last_name: string }[];
}
////////////////////////////////////////////////////////7
//interfaces para usuario//////////////////
//////////////////////////////////////////
export interface User {
  name: string;
  email: string;
  status: string;
  rol: string;
  delete_at: string;
  id: string;
}
////////////////////////////////////77

//interface para cambiar la vista
export interface SearchCardToggleProps {
  viewMode: "cards" | "table";
  setViewMode: (mode: "cards" | "table") => void;
  setSearchTerm: (term: string) => void;
  currentSection: "proyecto" | "colaboradores" | "vacante";
  onAddClick?: () => void;
  onAddSuccess?: () => void;
}

export type ActuColaborador = {
  id: string;
  first_name: string;
  last_name: string;
  rol: string[];
  Proyectos: any;
  email: string;
  estado: string;
  horasAsignadas: string | number;
  tecnologias: string[];
  last_edited_on: string;
  delete_at: string;
};
export type RegisterProjectBody = {
  managerId: string | null;
  managerName: string | null;
  image: string| null;
  name: string;
  client: string | null;
  status: string | null;
  projectType: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null
  managerVisibleInOrgChart?: boolean;
  category: "Gobierno" | "Privado" | "Inversion" | null;
  budget: number | null;
};


export type Tecnologia = {
  id: string;
  name: string;
};

export type Manager = {
  manager_id: string;
  manager_name: string;
  manager_role: string;
};

export type Job = {
  id: string;
  name: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;

}

export type Skill = {
  id: string;
  name: string;
}

export type Client = {
  id: string;
  name: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}
export type GetClientResponse={
  status: string;
  clients: Client[];
}