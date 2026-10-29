import { difficulties, getProgram } from "../data/programs.js";

export function validNumber(
  value,
  { integer = false, min = 0, max = 2000 } = {},
) {
  if (typeof value !== "string" && typeof value !== "number") return false;
  if (String(value).trim() === "") return false;
  const n = Number(value);
  return (
    Number.isFinite(n) &&
    n >= min &&
    n <= max &&
    (!integer || Number.isInteger(n))
  );
}
export const isComplete = (p) =>
  Boolean(
    p &&
    validNumber(p.weight) &&
    validNumber(p.sets, { integer: true, min: 1, max: 100 }) &&
    validNumber(p.reps, { integer: true, min: 1, max: 1000 }) &&
    difficulties.includes(p.difficulty),
  );
export const hasInput = (p) =>
  Boolean(p && Object.values(p).some((v) => v !== ""));
export const volume = (p) =>
  isComplete(p)
    ? Math.round(Number(p.weight) * Number(p.sets) * Number(p.reps) * 100) / 100
    : 0;
export const sessionVolume = (session) =>
  Object.values(session.performances).reduce((sum, p) => sum + volume(p), 0);
export const completedCount = (session) =>
  Object.values(session?.performances || {}).filter(isComplete).length;
export const sortedSessions = (sessions) =>
  [...sessions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
export function lastPerformance(sessions, exerciseId) {
  const session = sortedSessions(sessions).find((s) =>
    isComplete(s.performances[exerciseId]),
  );
  return session
    ? { ...session.performances[exerciseId], date: session.startedAt }
    : null;
}
export function createSession(programId) {
  if (!getProgram(programId)) throw new Error("Programme inconnu.");
  return {
    id: crypto.randomUUID(),
    programId,
    startedAt: new Date().toISOString(),
    performances: {},
  };
}
export function finishSession(active, finishedAt = new Date().toISOString()) {
  return {
    ...active,
    finishedAt,
    performances: Object.fromEntries(
      Object.entries(active.performances)
        .filter(([, p]) => isComplete(p))
        .map(([id, p]) => [
          id,
          {
            weight: Number(p.weight),
            sets: Number(p.sets),
            reps: Number(p.reps),
            difficulty: p.difficulty,
          },
        ]),
    ),
  };
}
