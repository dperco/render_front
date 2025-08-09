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

// Resto de tu código de la página...

export async function getStaticProps() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/metrics`);
    const data = await res.json();
    return {
      props: { data },
      revalidate: 60
    };
  } catch (error) {
    return {
      props: { 
        data: null,
        error: "Failed to fetch data during build"
      },
      revalidate: 10
    };
  }
}
