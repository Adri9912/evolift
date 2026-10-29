import { useEffect, useState } from "react";
import { Check, Clock3, Dumbbell, Play, ShieldCheck } from "lucide-react";
import { getProgram, programs, estimatedDuration } from "../data/programs.js";
import { completedCount, lastPerformance } from "../utils/performance.js";
import { duration } from "../utils/format.js";
import ExerciseCard from "../components/ExerciseCard.jsx";
export default function Session({
  data,
  selected,
  setSelected,
  onStart,
  onUpdate,
  onFinish,
}) {
  const active = data.activeSession,
    program = getProgram(active?.programId || selected);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, [active?.id]);
  const count = completedCount(active);
  return (
    <div className="session-page page-enter">
      <div className="page-intro">
        <div>
          <p className="eyebrow accent">
            {active ? "À TON RYTHME" : "PRÉPARE TA SÉANCE"}
          </p>
          <h1>
            {active ? "Ta séance" : "Le programme"} <span>{program.name}.</span>
          </h1>
          <p>{program.muscles}</p>
        </div>
        {active && (
          <span className="date-chip">
            <Clock3 size={16} />
            {duration(active)} min écoulée{duration(active) > 1 ? "s" : ""}
          </span>
        )}
      </div>
      {!active && (
        <div className="program-tabs" aria-label="Choisir un programme">
          {programs.map((p) => (
            <button
              key={p.id}
              className={selected === p.id ? "active" : ""}
              aria-pressed={selected === p.id}
              onClick={() => setSelected(p.id)}
            >
              {p.name}
              <span>{p.exercises.length} exercices</span>
            </button>
          ))}
        </div>
      )}
      <section className="warmup panel">
        <span className="eyebrow accent">ON S’ÉCHAUFFE ?</span>
        <h2>Un bon départ change tout.</h2>
        <div className="warmup-grid">
          <p>
            <b>01 / Cardio · 10 min</b>
            <span>Vélo ou course, progressivement.</span>
          </p>
          <p>
            <b>02 / Mobilité · 5–10 min</b>
            <span>{program.mobility}.</span>
          </p>
        </div>
        <p className="muted small">
          Musculation estimée : {program.timing.strength} min
          {program.timing.finish
            ? " · Fin de séance : 5 min de StairMaster"
            : ""}{" "}
          · Total : ~ {estimatedDuration(program)} min
        </p>
      </section>
      {active ? (
        <div className="session-progress">
          <div>
            <span>
              <b>{count}</b> / {program.exercises.length} exercices renseignés
            </span>
            <span className="small muted">
              <ShieldCheck size={14} /> Saisie sauvegardée automatiquement
            </span>
          </div>
          <progress
            aria-label="Exercices renseignés"
            max={program.exercises.length}
            value={count}
          />
        </div>
      ) : (
        <button
          className="button primary start-session"
          onClick={() => onStart(program.id)}
        >
          <Play size={18} /> Commencer la séance
        </button>
      )}
      <div className="exercise-list">
        {program.exercises.map((e, i) => (
          <ExerciseCard
            key={e.id}
            exercise={e}
            index={i}
            performance={active?.performances[e.id]}
            last={lastPerformance(data.sessions, e.id)}
            onChange={active ? (p) => onUpdate(e.id, p) : undefined}
          />
        ))}
      </div>
      {program.timing.finish > 0 && (
        <div className="panel finisher">
          <Dumbbell size={22} />
          <div>
            <b>Le dernier effort.</b>
            <p className="muted small">
              Termine avec 5 minutes de StairMaster.
            </p>
          </div>
        </div>
      )}
      {active && (
        <div className="finish-session">
          <p className="muted small">
            Tu peux quitter cette page et reprendre plus tard.
            <br />
            Les exercices incomplets ne seront pas comptés.
          </p>
          <button className="button primary" onClick={onFinish}>
            <Check size={18} /> Terminer la séance
          </button>
        </div>
      )}
    </div>
  );
}
