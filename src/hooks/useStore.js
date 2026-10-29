import { useRef, useState } from "react";
import { emptyData, loadData, saveData } from "../services/storage.js";

export function useStore() {
  const [initial] = useState(() => {
    try {
      return loadData(window.localStorage);
    } catch {
      return {
        data: emptyData(),
        error:
          "Stockage local indisponible. Exporte tes données avant de fermer cet onglet.",
        blocked: true,
      };
    }
  });
  const [data, setData] = useState(initial.data);
  const [error, setError] = useState(initial.error);
  const current = useRef(initial.data);
  const blocked = useRef(initial.blocked);
  const commit = (updater, { replace = false, required = false } = {}) => {
    const next =
      typeof updater === "function" ? updater(current.current) : updater;
    try {
      if (blocked.current && !replace)
        throw new Error(
          initial.error ||
            "La sauvegarde est bloquée. Exporte les données puis utilise l’import ou la réinitialisation.",
        );
      saveData(window.localStorage, next);
      blocked.current = false;
      setError("");
    } catch (e) {
      setError(e.message);
      if (required || replace) return false;
    }
    current.current = next;
    setData(next);
    return true;
  };
  return { data, error, commit };
}
