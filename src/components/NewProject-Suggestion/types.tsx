export interface Candidate {
    id: string;
    name: string;
    score: number;              // 0-100
    is_user_suggestion: boolean; // true ⇒ candidato sugerido por el usuario
    suggestion_analysis: string | null; // null ⇒ no sugerido por IA
    suggested_by_ia: boolean;  // true ⇒ candidato sugerido por IA
    availability_message: string; // "Disponible (160h libres)" o "No disponible"
    missing_data_warnings: string[]; // ["evaluacion_de_desempeno", "sueldo"]
    known_technologies: string[]; // ["React", "NodeJs", "Angular"]
    selected?: boolean; // true ⇒ candidato elegido por el usuario (max 1 por rol)

  }
  
  export interface Role {
    id: string;
    name: string;              
    candidates: Candidate[];
  }
  
  export interface Vacancy {
    id: string;
    role: string;             
    technology: string;
    weeklyHours: number;
  }
  
  export interface ProjectInfo {
    name: string;
    description: string;
    startDate: string;          // ISO
    endDate:   string;          // ISO
    roles: Role[];
    vacancies: Vacancy[];
  }

  export interface Position {
    position_id: string;
    role_requested: string;
    seniority_requested: string;
    candidates: Candidate[];
    vacancy_needed?: boolean;
    vacancy_message?: string;
    technologies_requested: string[];
  } 
  