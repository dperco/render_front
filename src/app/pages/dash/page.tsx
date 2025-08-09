import { Suspense } from "react";
import {
  metricsDashboard
} from "@/services/api";
import DashClientView from "./dashClientView";

export default async function Home() {

  const resultMetrics = await metricsDashboard();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashClientView  metrics={resultMetrics} />
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
