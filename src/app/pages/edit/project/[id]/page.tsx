import { Suspense } from "react";
import EditClientView from "@/app/pages/edit/project/EditClientView";
import {
  fetchProjectById, fetchManager, fetchProjectStates, getClient
} from "@/services/api";

export default async function ProjectEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const resultProject = await fetchProjectById(id);
  const managerResult = await fetchManager();
  const stateResult = await fetchProjectStates();
  const clientResult = await getClient();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditClientView project={resultProject} manager={managerResult} states={stateResult} client={clientResult} />
    </Suspense>
  );
}
