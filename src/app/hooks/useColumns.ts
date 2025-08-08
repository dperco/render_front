
import { useEffect, useState } from "react";
import { ColumnConfig } from "@/types/interface";
import { getColumns } from "@/services/api";

export function useColumns(entity: string) {
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchColumns() {
      try {
        const cols = await getColumns(entity);
        setColumns(cols);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchColumns();
  }, [entity]);

  return { columns, loading, error };
}