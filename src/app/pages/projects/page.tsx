import { Suspense } from "react";
import ProjectClientView from "./projectClientView";
import { fetchCollaborators, fetchProjects, getUsers } from "@/services/api";
export default async function Projects() {
  const resultProjects = await fetchProjects();

  const resultColaboradore = await fetchCollaborators();
  const resultUsers = await getUsers();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectClientView
        projectsProp={resultProjects}
        collaboratorsProp={resultColaboradore}
        usersProp={resultUsers}
      />
    </Suspense>
  );
}
