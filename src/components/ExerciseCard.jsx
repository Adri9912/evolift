import { useState } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  Info,
  Minus,
  Plus,
} from "lucide-react";
import { difficulties } from "../data/programs.js";
import { hasInput, isComplete, validNumber } from "../utils/performance.js";
import { date, number } from "../utils/format.js";
import MuscleMap from "./MuscleMap.jsx";
const blank = { weight: "", sets: "", reps: "", difficulty: "" };
export default function ExerciseCard({
  exercise: e,
  index,
  performance,
  last,
  onChange,
}) {
  const p = performance || blank;
  const [error, setError] = useState("");
  function update(key, value) {
    const max = key === "weight" ? 2000 : key === "sets" ? 100 : 1000;
    if (
      value !== "" &&
      !validNumber(value, { integer: key !== "weight", min: 0, max })
    ) {
      setError(
        `Saisis ${key === "weight" ? "un poids positif" : "un nombre entier positif"} (maximum ${max}).`,
      );
      return;
    }
    setError("");
    onChange({ ...p, [key]: value });
  }
  function adjust(key, delta) {
    const minimum = key === "weight" ? 0 : 1;
    const value = Number((Number(p[key] || 0) + delta).toFixed(6));
    update(key, String(Math.max(minimum, value)));
  }
  return (
    <article
      className={`exercise-card ${isComplete(p) ? "exercise-complete" : ""}`}
    >
      <div className="exercise-heading">
        <span className="exercise-index">
          {isComplete(p) ? (
            <Check size={19} />
          ) : (
            String(index + 1).padStart(2, "0")
          )}
        </span>
        <div>
          <span className="eyebrow accent">{e.muscle}</span>
          <h3>{e.name}</h3>
        </div>
        <span className="rest-chip">
          <Clock3 size={14} />
          {e.rest} s
        </span>
      </div>
      <p className="exercise-target">
        Objectif{" "}
        <b>
          {e.sets} séries × {e.reps} répétitions
        </b>
      </p>
      {e.note && (
        <p className="exercise-note">
          <Info size={15} />
          {e.note}
        </p>
      )}
      {onChange && (
        <>
          <div className="performance-inputs">
            {[
              ["weight", "Poids", "kg", "0.5"],
              ["sets", "Séries effectuées", "séries", "1"],
              ["reps", "Répétitions / série", "rép.", "1"],
            ].map(([key, label, unit, step]) => (
              <div className="performance-row" key={key}>
                <label htmlFor={`${e.id}-${key}`}>
                  {key === "weight" ? "Poids (kg)" : label}
                </label>
                <div className="number-field">
                  <button
                    type="button"
                    className="step-button"
                    aria-label={`Diminuer ${label.toLowerCase()} pour ${e.name}`}
                    onClick={() => adjust(key, -Number(step))}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    aria-label={`${label} ${unit}`}
                    id={`${e.id}-${key}`}
                    type="number"
                    inputMode={key === "weight" ? "decimal" : "numeric"}
                    min={key === "weight" ? "0" : "1"}
                    max={
                      key === "weight"
                        ? "2000"
                        : key === "sets"
                          ? "100"
                          : "1000"
                    }
                    step={key === "weight" ? "any" : step}
                    placeholder="—"
                    value={p[key]}
                    onChange={(event) => update(key, event.target.value)}
                  />
                  <span>{unit}</span>
                  <button
                    type="button"
                    className="step-button"
                    aria-label={`Augmenter ${label.toLowerCase()} pour ${e.name}`}
                    onClick={() => adjust(key, Number(step))}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <fieldset className="difficulty-field">
            <legend>Difficulté ressentie</legend>
            <div className="difficulty-buttons">
              {difficulties.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  className={`difficulty difficulty-${i} ${p.difficulty === d ? "selected" : ""}`}
                  aria-pressed={p.difficulty === d}
                  onClick={() =>
                    onChange({ ...p, difficulty: p.difficulty === d ? "" : d })
                  }
                >
                  {p.difficulty === d ? (
                    <Check size={16} />
                  ) : (
                    <span className="difficulty-dot" />
                  )}
                  {d}
                </button>
              ))}
            </div>
          </fieldset>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          {hasInput(p) && !isComplete(p) && (
            <p className="muted small">
              Renseigne un poids (0 autorisé), au moins une série et une
              répétition, puis la difficulté.
            </p>
          )}
        </>
      )}
      {last && (
        <div className="last-performance">
          <span>DERNIÈRE FOIS · {date(last.date)}</span>
          <b>
            {number(last.weight)} kg <i>×</i> {last.sets} séries <i>×</i>{" "}
            {last.reps} rép. <small>· {last.difficulty}</small>
          </b>
        </div>
      )}
      <details className="technique">
        <summary>
          Voir la technique <ChevronDown size={16} />
        </summary>
        <div>
          <MuscleMap exercise={e} />
          <p>
            <b>Muscle principal :</b> {e.muscle}
            <br />
            <b>Muscles secondaires :</b> {e.secondary}
          </p>
          <p>
            <b>Le bon geste</b>
            <br />
            {e.tips}
          </p>
          <p>
            <b>À éviter</b>
            <br />
            {e.mistakes}
          </p>
          <a
            className="external-link"
            href={e.demo}
            target="_blank"
            rel="noreferrer"
          >
            Démonstration MuscleWiki <ExternalLink size={14} />
          </a>
          <p className="muted small">
            Connexion Internet nécessaire · La démonstration peut être en
            anglais.
          </p>
        </div>
      </details>
    </article>
  );
}
