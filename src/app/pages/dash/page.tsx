// import { Suspense } from "react";
// import {
//   metricsDashboard
// } from "@/services/api";
// import DashClientView from "./dashClientView";

// export default async function Home() {

//   const resultMetrics = await metricsDashboard();

//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <DashClientView  metrics={resultMetrics} />
//     </Suspense>
//   );
// }

// Resto de tu código de la página...

// export async function getStaticProps() {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/metrics`);
//     const data = await res.json();
//     return {
//       props: { data },
//       revalidate: 60
//     };
//   } catch (error) {
//     return {
//       props: { 
//         data: null,
//         error: "Failed to fetch data during build"
//       },
//       revalidate: 10
//     };
//   }
// }

// src/app/pages/dash/page.tsx
import { unstable_noStore as noStore } from 'next/cache';

export default async function DashPage() {
  noStore(); // Opcional: para comportamiento dinámico
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/metrics`);
    const data = await res.json();
    
    return (
      // Tu JSX aquí usando data
      <div>
        <h1>Dashboard Metrics</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }
  catch (error) {
    return (
      <div>
        <h1>Error loading data</h1>
        <p>Fallback content</p>
      </div>
    );
  }
}
