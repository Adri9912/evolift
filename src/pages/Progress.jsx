import { lazy, Suspense, useState } from "react";
import { TrendingUp } from "lucide-react";
import { allExercises } from "../data/programs.js";
import { date, number } from "../utils/format.js";
import { isComplete, sortedSessions, volume } from "../utils/performance.js";
const PerformanceChart = lazy(
  () => import("../components/PerformanceChart.jsx"),
);
const metrics = {
  weight: ["Poids utilisé", "kg"],
  reps: ["Répétitions par série", "rép."],
  sets: ["Séries effectuées", "séries"],
  volume: ["Volume estimé", "kg"],
};
export default function Progress({ sessions }) {
  const [exerciseId, setExerciseId] = useState(allExercises[0].id);
  const [metric, setMetric] = useState("weight");
  const points = sortedSessions(sessions)
    .reverse()
    .filter((s) => isComplete(s.performances[exerciseId]))
    .map((s) => ({
      ...s.performances[exerciseId],
      weight: Number(s.performances[exerciseId].weight),
      sets: Number(s.performances[exerciseId].sets),
      reps: Number(s.performances[exerciseId].reps),
      volume: volume(s.performances[exerciseId]),
      date: date(s.startedAt, { month: "short" }),
      fullDate: date(s.startedAt, {
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      id: s.id,
    }));
  const last = points.at(-1);
  return (
    <div className="progress-page page-enter">
      <div className="page-intro">
        <div>
          <p className="eyebrow accent">PRENDS DU RECUL</p>
          <h1>
            Progression<span>.</span>
          </h1>
          <p>Des repères concrets pour avancer à ton rythme.</p>
        </div>
      </div>
      <section className="panel">
        <label className="select-label" htmlFor="exercise-select">
          Choisir un exercice
        </label>
        <select
          id="exercise-select"
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
        >
          {allExercises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        {last ? (
          <>
            <div className="section-title compact mt-8">
              <h2>Dernière performance</h2>
              <span className="muted small">{last.fullDate}</span>
            </div>
            <div className="performance-stats">
              <div>
                <strong>
                  {number(last.weight)} <small>kg</small>
                </strong>
                <span>Poids utilisé</span>
              </div>
              <div>
                <strong>
                  {last.sets} <small>×</small> {last.reps}
                </strong>
                <span>Séries × répétitions</span>
              </div>
              <div>
                <strong>
                  {number(last.volume)} <small>kg</small>
                </strong>
                <span>Volume estimé</span>
              </div>
              <div>
                <strong className={`difficulty-label level-${last.difficulty}`}>
                  {last.difficulty}
                </strong>
                <span>Difficulté ressentie</span>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <TrendingUp size={40} />
            <h2>Ta progression commence ici.</h2>
            <p>
              Enregistre cet exercice pendant une séance pour afficher tes
              premiers repères.
            </p>
          </div>
        )}
        {points.length > 0 && (
          <>
            <div className="metric-tabs" aria-label="Mesure du graphique">
              {Object.entries(metrics).map(([key, [label]]) => (
                <button
                  key={key}
                  aria-pressed={key === metric}
                  className={key === metric ? "active" : ""}
                  onClick={() => setMetric(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            {points.length < 2 ? (
              <p className="data-message">
                Une première performance est enregistrée. Il faut au moins deux
                séances avec cet exercice pour tracer une évolution.
              </p>
            ) : (
              <Suspense
                fallback={
                  <p className="data-message">Chargement du graphique…</p>
                }
              >
                <PerformanceChart
                  points={points}
                  metric={metric}
                  label={metrics[metric][0]}
                  unit={metrics[metric][1]}
                />
              </Suspense>
            )}
          </>
        )}
      </section>
      <p className="progress-explanation">
        Le poids ne raconte pas toute l’histoire : compare aussi les séries, les
        répétitions et la difficulté. Une charge plus élevée avec moins de
        répétitions ne signifie pas automatiquement une progression.
      </p>
      {points.length > 0 && (
        <section className="panel">
          <h2>Tous tes repères</h2>
          <div className="progress-records">
            {[...points].reverse().map((p) => (
              <div key={p.id}>
                <span>{p.fullDate}</span>
                <b>
                  {number(p.weight)} kg · {p.sets} × {p.reps}
                </b>
                <span className={`difficulty-label level-${p.difficulty}`}>
                  {p.difficulty}
                </span>
                <small>{number(p.volume)} kg de volume</small>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
