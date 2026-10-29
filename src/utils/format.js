export const number = (value) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value);
export const date = (value, options = {}) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    ...options,
  }).format(new Date(value));
export const duration = (session) =>
  Math.max(
    1,
    Math.round(
      (new Date(session.finishedAt || Date.now()) -
        new Date(session.startedAt)) /
        60000,
    ),
  );
