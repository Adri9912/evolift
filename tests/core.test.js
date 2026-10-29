import test from "node:test";
import assert from "node:assert/strict";
import { allExercises, programs } from "../src/data/programs.js";
import {
  completedCount,
  createSession,
  finishSession,
  isComplete,
  lastPerformance,
  sessionVolume,
  sortedSessions,
  validNumber,
  volume,
} from "../src/utils/performance.js";
import {
  emptyData,
  loadData,
  parseImport,
  saveData,
  STORAGE_KEY,
  validateData,
} from "../src/services/storage.js";
const performance = {
  weight: "40.5",
  sets: "3",
  reps: "10",
  difficulty: "Moyen",
};
const active = () => ({
  id: "session-1",
  programId: "push",
  startedAt: "2026-10-01T10:00:00.000Z",
  performances: { "chest-press": { ...performance } },
});
const completed = () => finishSession(active(), "2026-10-01T11:00:00.000Z");
const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};

test("les 17 exercices respectent le programme et ont des identifiants uniques", () => {
  assert.deepEqual(
    programs.map((p) => p.exercises.length),
    [6, 6, 5],
  );
  assert.equal(new Set(allExercises.map((e) => e.id)).size, 17);
  assert.equal(programs[0].exercises[0].id, "pec-fly");
  assert.deepEqual(
    programs[2].exercises.slice(0, 3).map((e) => e.id),
    ["leg-curl", "leg-extension", "leg-press"],
  );
  assert.equal(programs[0].exercises[3].sets, 4);
});
test("le volume prend en compte les poids décimaux", () => {
  assert.equal(volume(performance), 1215);
  assert.equal(sessionVolume(active()), 1215);
  assert.equal(
    volume({ ...performance, weight: "2.55", reps: "3", sets: "3" }),
    22.95,
  );
});
test("les valeurs absentes, infinies, négatives, booléennes et non entières sont rejetées", () => {
  for (const v of ["", " ", null, true, {}, [], Infinity, NaN, -1, "abc"])
    assert.equal(validNumber(v), false);
  assert.equal(isComplete({ ...performance, sets: "2.5" }), false);
  assert.equal(isComplete({ ...performance, reps: "0" }), false);
  assert.equal(isComplete({ ...performance, difficulty: "" }), false);
  assert.equal(isComplete({ ...performance, weight: 0 }), true);
  assert.equal(isComplete({ ...performance, sets: 101 }), false);
  assert.equal(volume({ ...performance, difficulty: "" }), 0);
});
test("une nouvelle séance commence sans performances préremplies", () => {
  const first = createSession("pull"),
    second = createSession("pull");
  assert.deepEqual(first.performances, {});
  assert.notEqual(first.id, second.id);
  assert.throws(() => createSession("unknown"));
});
test("terminer une séance écarte les saisies partielles et laisse le brouillon intact", () => {
  const s = active();
  s.performances["pec-fly"] = {
    weight: "10",
    sets: "",
    reps: "",
    difficulty: "",
  };
  const snapshot = structuredClone(s),
    result = finishSession(s, "2026-10-01T11:00:00.000Z");
  assert.equal(completedCount(s), 1);
  assert.deepEqual(Object.keys(result.performances), ["chest-press"]);
  assert.equal(result.performances["chest-press"].weight, 40.5);
  assert.deepEqual(s, snapshot);
  result.performances["chest-press"].weight = 80;
  assert.equal(s.performances["chest-press"].weight, "40.5");
});
test("une séance vide peut être terminée sans compter d’exercice", () => {
  const s = active();
  s.performances = {};
  assert.equal(completedCount(finishSession(s)), 0);
  assert.equal(sessionVolume(s), 0);
});
test("la dernière performance est sélectionnée par date sans modifier l’historique", () => {
  const old = completed(),
    recent = {
      ...completed(),
      id: "recent",
      startedAt: "2026-10-02T10:00:00.000Z",
      finishedAt: "2026-10-02T11:00:00.000Z",
      performances: { "chest-press": { ...performance, weight: 50 } },
    };
  const sessions = [old, recent];
  assert.equal(lastPerformance(sessions, "chest-press").weight, 50);
  assert.equal(lastPerformance(sessions, "pec-fly"), null);
  assert.equal(sortedSessions(sessions)[0].id, "recent");
  assert.equal(sessions[0].id, old.id);
});
test("stockage : les séances et le brouillon survivent à une nouvelle lecture", () => {
  const storage = memoryStorage(),
    data = emptyData();
  data.sessions.push(completed());
  data.activeSession = { ...active(), id: "draft" };
  data.preferences.theme = "light";
  saveData(storage, data);
  assert.deepEqual(loadData(storage).data, data);
  assert.equal(loadData(storage).error, "");
});
test("stockage : les champs vides et zéro restent un brouillon reprenable", () => {
  const data = emptyData();
  data.activeSession = active();
  data.activeSession.performances["pec-fly"] = {
    weight: "",
    sets: "0",
    reps: "",
    difficulty: "",
  };
  assert.deepEqual(parseImport(JSON.stringify(data)), data);
  assert.equal(completedCount(data.activeSession), 1);
});
test("stockage corrompu : aucune réécriture et une erreur explicite", () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, "{broken");
  const result = loadData(storage);
  assert.equal(result.blocked, true);
  assert.ok(result.error);
  assert.equal(storage.getItem(STORAGE_KEY), "{broken");
});
test("stockage refusé ou saturé : échec explicite", () => {
  assert.equal(
    loadData({
      getItem() {
        throw new Error("denied");
      },
    }).blocked,
    true,
  );
  assert.throws(
    () =>
      saveData(
        {
          setItem() {
            throw new Error("quota");
          },
        },
        emptyData(),
      ),
    /Sauvegarde impossible/,
  );
});
test("import : accepte les fichiers Evolift et refuse le JSON invalide ou futur", () => {
  assert.deepEqual(parseImport(JSON.stringify(emptyData())), emptyData());
  assert.throws(() => parseImport("not json"), /JSON valide/);
  assert.throws(() => validateData({ ...emptyData(), schemaVersion: 2 }));
  assert.throws(() => parseImport(" ".repeat(10000001)), /volumineux/);
});
test("import : rejette les incohérences de séance et les performances invalides", () => {
  for (const change of [
    (d) => {
      d.sessions[0].programId = "fake";
    },
    (d) => {
      d.sessions[0].startedAt = "bad date";
    },
    (d) => {
      d.sessions[0].finishedAt = "2025-01-01";
    },
    (d) => {
      d.sessions[0].performances["chest-press"].weight = -10;
    },
    (d) => {
      d.sessions[0].performances["chest-press"].sets = 2.5;
    },
    (d) => {
      d.sessions[0].performances["chest-press"].difficulty = "Impossible";
    },
    (d) => {
      d.sessions[0].performances["leg-press"] = { ...performance };
    },
    (d) => {
      d.sessions[0].performances["pec-fly"] = { weight: 1 };
    },
    (d) => {
      d.sessions.push(structuredClone(d.sessions[0]));
    },
    (d) => {
      d.activeSession = active();
    },
    (d) => {
      d.preferences.theme = "invalid";
    },
  ]) {
    const data = emptyData();
    data.sessions = [completed()];
    change(data);
    assert.throws(() => validateData(data));
  }
});
test("import : les champs supplémentaires sont retirés", () => {
  const input = { ...emptyData(), arbitrary: true };
  input.preferences.extra = "ignored";
  assert.deepEqual(validateData(input), emptyData());
});
test("enregistrer une nouvelle séance ajoute une entrée et ne modifie pas la précédente", () => {
  const old = completed(),
    snapshot = structuredClone(old),
    next = active();
  next.id = "second";
  const sessions = [...[old], finishSession(next, "2026-10-01T11:00:00.000Z")];
  assert.equal(sessions.length, 2);
  assert.deepEqual(sessions[0], snapshot);
});

test("profil : les anciennes sauvegardes restent compatibles et conservent les séances", () => {
  const legacy = {
    schemaVersion: 1,
    sessions: [completed()],
    activeSession: { ...active(), id: "draft" },
    preferences: { theme: "light" },
  };
  const migrated = parseImport(JSON.stringify(legacy));
  assert.deepEqual(migrated.sessions, legacy.sessions);
  assert.deepEqual(migrated.activeSession, legacy.activeSession);
  assert.deepEqual(migrated.preferences, {
    theme: "light",
    givenName: "",
    welcomeCompleted: false,
  });
});
test("profil : le prénom, les accents et le choix de passer sont mémorisés", () => {
  const storage = memoryStorage();
  for (const givenName of ["Éléonore", "Jean-Luc", ""]) {
    const data = emptyData();
    data.preferences = { theme: "dark", givenName, welcomeCompleted: true };
    saveData(storage, data);
    assert.deepEqual(loadData(storage).data.preferences, data.preferences);
  }
});
test("profil : normalise les espaces et refuse les formats invalides importés", () => {
  const data = emptyData();
  data.preferences.givenName = "  Anne   Marie  ";
  assert.equal(validateData(data).preferences.givenName, "Anne Marie");
  for (const givenName of [null, 12, {}, "A".repeat(41)]) {
    assert.throws(() =>
      validateData({
        ...emptyData(),
        preferences: { theme: "dark", givenName },
      }),
    );
  }
  assert.throws(() =>
    validateData({
      ...emptyData(),
      preferences: { theme: "dark", welcomeCompleted: "true" },
    }),
  );
});
test("profil : suggère la rotation et donne priorité à la séance en cours", async () => {
  const { suggestedProgramId } = await import("../src/utils/profile.js");
  assert.equal(suggestedProgramId(emptyData()), "push");
  assert.equal(
    suggestedProgramId({ ...emptyData(), sessions: [completed()] }),
    "pull",
  );
  assert.equal(
    suggestedProgramId({
      ...emptyData(),
      sessions: [{ ...completed(), programId: "legs" }],
    }),
    "push",
  );
  assert.equal(
    suggestedProgramId({
      ...emptyData(),
      sessions: [completed()],
      activeSession: { ...active(), programId: "legs" },
    }),
    "legs",
  );
});

test("chaque exercice possède des zones musculaires dessinées, y compris le ciblage du haut des pectoraux", async () => {
  const { exerciseMuscles, musclePaths } =
    await import("../src/data/muscles.js");
  const drawnMuscles = new Set(
    Object.values(musclePaths)
      .flat()
      .map(([id]) => id),
  );
  assert.deepEqual(
    Object.keys(exerciseMuscles).sort(),
    allExercises.map((e) => e.id).sort(),
  );
  for (const exercise of allExercises) {
    assert.ok(exerciseMuscles[exercise.id].length > 0, exercise.name);
    assert.ok(
      exerciseMuscles[exercise.id].every((id) => drawnMuscles.has(id)),
      exercise.name,
    );
  }
  assert.deepEqual(exerciseMuscles["incline-press"], ["upper-chest"]);
});
