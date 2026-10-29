import { getProgram } from "../data/programs.js";
import { isComplete, validNumber } from "../utils/performance.js";
import { normalizeGivenName } from "../utils/profile.js";

export const STORAGE_KEY = "evolift:data:v1";
export const emptyData = () => ({
  schemaVersion: 1,
  sessions: [],
  activeSession: null,
  preferences: { theme: "dark", givenName: "", welcomeCompleted: false },
});
const object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const validDate = (v) =>
  typeof v === "string" && Number.isFinite(Date.parse(v));
function validatePerformance(p, draft) {
  if (!object(p)) return false;
  if (!draft) return isComplete(p);
  return (
    ["weight", "sets", "reps", "difficulty"].every(
      (key) => typeof p[key] === "string" || typeof p[key] === "number",
    ) &&
    Object.keys(p).every((key) =>
      ["weight", "sets", "reps", "difficulty"].includes(key),
    ) &&
    (p.weight === "" || validNumber(p.weight)) &&
    (p.sets === "" ||
      validNumber(p.sets, { integer: true, min: 0, max: 100 })) &&
    (p.reps === "" ||
      validNumber(p.reps, { integer: true, min: 0, max: 1000 })) &&
    ["", "Facile", "Moyen", "Dur"].includes(p.difficulty)
  );
}
function validateSession(s, draft) {
  if (
    !object(s) ||
    typeof s.id !== "string" ||
    !s.id ||
    s.id.length > 100 ||
    !getProgram(s.programId) ||
    !validDate(s.startedAt) ||
    !object(s.performances)
  )
    return false;
  if (
    draft
      ? s.finishedAt !== undefined
      : !validDate(s.finishedAt) ||
        Date.parse(s.finishedAt) < Date.parse(s.startedAt)
  )
    return false;
  const allowed = new Set(getProgram(s.programId).exercises.map((e) => e.id));
  return Object.entries(s.performances).every(
    ([id, p]) => allowed.has(id) && validatePerformance(p, draft),
  );
}
export function validateData(data) {
  if (
    !object(data) ||
    data.schemaVersion !== 1 ||
    !Array.isArray(data.sessions) ||
    data.sessions.length > 20000 ||
    !object(data.preferences) ||
    !["light", "dark"].includes(data.preferences.theme) ||
    (data.preferences.givenName !== undefined &&
      (typeof data.preferences.givenName !== "string" ||
        data.preferences.givenName.length > 40)) ||
    (data.preferences.welcomeCompleted !== undefined &&
      typeof data.preferences.welcomeCompleted !== "boolean") ||
    !data.sessions.every((s) => validateSession(s, false)) ||
    !(data.activeSession === null || validateSession(data.activeSession, true))
  )
    throw new Error(
      "Sauvegarde invalide ou version non prise en charge. Aucune donnée remplacée.",
    );
  const ids = [
    ...data.sessions.map((s) => s.id),
    ...(data.activeSession ? [data.activeSession.id] : []),
  ];
  if (new Set(ids).size !== ids.length)
    throw new Error("La sauvegarde contient des séances en double.");
  // Recrée un format connu : aucun champ importé arbitraire n'est conservé.
  const cleanSession = (s, active) => ({
    id: s.id,
    programId: s.programId,
    startedAt: s.startedAt,
    ...(!active ? { finishedAt: s.finishedAt } : {}),
    performances: Object.fromEntries(
      Object.entries(s.performances).map(([id, p]) => [
        id,
        {
          weight: p.weight,
          sets: p.sets,
          reps: p.reps,
          difficulty: p.difficulty,
        },
      ]),
    ),
  });
  return {
    schemaVersion: 1,
    sessions: data.sessions.map((s) => cleanSession(s, false)),
    activeSession: data.activeSession
      ? cleanSession(data.activeSession, true)
      : null,
    preferences: {
      theme: data.preferences.theme,
      givenName: normalizeGivenName(data.preferences.givenName ?? ""),
      welcomeCompleted: data.preferences.welcomeCompleted ?? false,
    },
  };
}
export function loadData(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return {
      data: raw === null ? emptyData() : validateData(JSON.parse(raw)),
      error: "",
      blocked: false,
    };
  } catch {
    return {
      data: emptyData(),
      error:
        "Impossible de lire la sauvegarde locale. Les données existantes sont préservées. Exporte-les depuis les réglages avant de réinitialiser ou d’importer.",
      blocked: true,
    };
  }
}
export function saveData(storage, data) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    throw new Error(
      "Sauvegarde impossible : stockage indisponible ou plein. Garde cet onglet ouvert et exporte tes données depuis les réglages.",
    );
  }
}
export function parseImport(text) {
  if (text.length > 10000000)
    throw new Error("Fichier trop volumineux (maximum 10 Mo).");
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("Ce fichier ne contient pas un JSON valide.");
  }
  return validateData(value);
}
export function downloadJSON(
  data,
  filename = `evolift-${new Date().toISOString().slice(0, 10)}.json`,
) {
  const url = URL.createObjectURL(
    new Blob(
      [typeof data === "string" ? data : JSON.stringify(data, null, 2)],
      { type: "application/json" },
    ),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
