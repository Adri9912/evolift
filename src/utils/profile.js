export const normalizeGivenName = (value) =>
  value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// La séance en cours est prioritaire ; sinon on suit la rotation PUSH / PULL / LEGS.
export function suggestedProgramId(data) {
  if (data.activeSession) return data.activeSession.programId;
  const last = [...data.sessions].sort(
    (a, b) => new Date(b.startedAt) - new Date(a.startedAt),
  )[0];
  const rotation = ["push", "pull", "legs"];
  return rotation[(rotation.indexOf(last?.programId) + 1) % rotation.length];
}
