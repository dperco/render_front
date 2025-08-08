import { useEffect, useState } from "react";
import { getUsers } from "@/services/api";

export function useAuthRole() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const raw = localStorage.getItem("authData");
        if (!raw) return;
        const { user } = JSON.parse(raw);
        const users = await getUsers();
        const me = users.find((u: any) => u.email === user.email);

        if (me?.rol === "administrador") {
          setIsAdmin(true);
        } else if (me?.rol === "manager") {
          setIsManager(true);
        }

        setCurrentUser(me?.name ?? null);
      } catch (error) {
        console.error("Error checking auth role:", error);
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, []);

  return { isAdmin, isManager, currentUser, loading };
}
