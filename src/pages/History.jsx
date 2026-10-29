import {
  CalendarDays,
  ChevronDown,
  History as HistoryIcon,
  Trash2,
} from "lucide-react";
import { getProgram, allExercises } from "../data/programs.js";
import {
  completedCount,
  sessionVolume,
  sortedSessions,
  volume,
} from "../utils/performance.js";
import { date, duration, number } from "../utils/format.js";
export default function History({ sessions, onDelete, navigate }) {
  return (
    <div className="page-enter">
      <div className="page-intro">
        <div>
          <p className="eyebrow accent">TON CARNET D’ENTRAÎNEMENT</p>
          <h1>
            Historique<span>.</span>
          </h1>
          <p>
            {sessions.length} séance{sessions.length > 1 ? "s" : ""} terminée
            {sessions.length > 1 ? "s" : ""}. Et autant de pas en avant.
          </p>
        </div>
      </div>
      {!sessions.length ? (
        <div className="empty-state panel">
          <HistoryIcon size={42} />
          <h2>Le début de ton parcours.</h2>
          <p>
            Tes séances terminées et leurs performances seront conservées ici.
          </p>
          <button
            className="button primary"
            onClick={() => navigate("session")}
          >
            Découvrir mon programme
          </button>
        </div>
      ) : (
        <div className="history-list">
          {sortedSessions(sessions).map((s) => (
            <article className="panel history-card" key={s.id}>
              <details>
                <summary>
                  <img
                    className="history-thumbnail"
                    src={`${import.meta.env.BASE_URL}images/${s.programId}.webp`}
                    alt=""
                    loading="lazy"
                  />
                  <div className="history-title">
                    <h2>
                      {getProgram(s.programId).name}{" "}
                      <span>{date(s.startedAt, { year: "numeric" })}</span>
                    </h2>
                    <p>
                      {completedCount(s)} exercices · {duration(s)} min ·{" "}
                      {number(sessionVolume(s))} kg de volume
                    </p>
                  </div>
                  <ChevronDown size={20} />
                </summary>
                <div className="history-performances">
                  {!completedCount(s) && (
                    <p className="muted">Aucun exercice effectué enregistré.</p>
                  )}
                  {Object.entries(s.performances).map(([id, p]) => (
                    <div className="history-exercise" key={id}>
                      <div>
                        <h3>
                          {allExercises.find((e) => e.id === id)?.name || id}
                        </h3>
                        <p>
                          {number(p.weight)} kg × {p.sets} séries × {p.reps}{" "}
                          rép.
                        </p>
                      </div>
                      <div>
                        <span
                          className={`difficulty-label level-${p.difficulty}`}
                        >
                          {p.difficulty}
                        </span>
                        <p>{number(volume(p))} kg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
              <div className="history-footer">
                <span>
                  <CalendarDays size={14} />
                  {date(s.startedAt, { hour: "2-digit", minute: "2-digit" })}
                </span>
                <button
                  className="text-button delete-button"
                  onClick={() => onDelete(s)}
                >
                  <Trash2 size={15} /> Supprimer la séance
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
