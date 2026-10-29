import {
  ArrowRight,
  Clock3,
  Play,
  Check,
  CalendarDays,
  Dumbbell,
  Flame,
  History,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import ProgramCard from "../components/ProgramCard.jsx";
import { getProgram, programs, estimatedDuration } from "../data/programs.js";
import { suggestedProgramId } from "../utils/profile.js";
import {
  completedCount,
  sessionVolume,
  sortedSessions,
} from "../utils/performance.js";
import { date, number } from "../utils/format.js";
export default function Dashboard({ data, onStart, onView, navigate }) {
  const givenName = data.preferences.givenName;
  const suggested = getProgram(suggestedProgramId(data));
  const sessions = sortedSessions(data.sessions),
    last = sessions[0];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d;
  });
  const week = sessions.filter(
    (s) =>
      new Date(s.startedAt) >=
      new Date(new Date().setHours(0, 0, 0, 0) - 6 * 86400000),
  );
  const weekVolume = week.reduce((sum, s) => sum + sessionVolume(s), 0);
  return (
    <div className="dashboard-page page-enter">
      <div className="page-intro">
        <div>
          <p className="greeting">
            {givenName
              ? `Bonjour, ${givenName}.`
              : "Bienvenue dans ton espace."}
          </p>
          <h1>Ton entraînement.</h1>
        </div>
        <span className="date-chip">
          <CalendarDays size={16} />
          {date(Date.now(), { weekday: "long" })}
        </span>
      </div>
      <section className="training-banner" aria-label="Chaque séance compte">
        <img
          src={`${import.meta.env.BASE_URL}images/hero.webp`}
          alt=""
          fetchPriority="high"
        />
        <div>
          <span className="eyebrow">CHAQUE SÉANCE COMPTE</span>
          <h2>
            La discipline aujourd’hui.
            <br />
            <em>Les résultats demain.</em>
          </h2>
          <p>Un entraînement de plus vers une meilleure version de toi.</p>
        </div>
      </section>
      <div className="section-title">
        <div>
          <p className="eyebrow">À TOI DE JOUER</p>
          <h2>Tes programmes</h2>
        </div>
        <span className="subtle-label">PUSH / PULL / LEGS</span>
      </div>
      <section className="program-grid">
        {programs.map((p, i) => (
          <ProgramCard
            key={p.id}
            program={p}
            index={i}
            suggested={p.id === suggested.id}
            onStart={onStart}
            onView={onView}
          />
        ))}
      </section>
      <div className="dashboard-top">
        <section className="next-workout" aria-label="Ta prochaine séance">
          <div className="next-workout-top">
            <span className="eyebrow">
              {data.activeSession
                ? "TA SÉANCE EN COURS"
                : "AUJOURD’HUI, ON S’ENTRAÎNE"}
            </span>
            <span className="workout-status">
              <span className="status-dot" />
              {data.activeSession ? "En cours" : "À ton rythme"}
            </span>
          </div>
          <div className="next-workout-body">
            <div>
              <h2>
                {suggested.name}
                <span>.</span>
              </h2>
              <p>{suggested.muscles}</p>
            </div>
            <div className="workout-emblem" aria-hidden="true">
              <Dumbbell strokeWidth={1.2} />
            </div>
          </div>
          <div className="next-workout-meta">
            <span>
              <Dumbbell size={14} />
              {suggested.exercises.length} exercices
            </span>
            <span>
              <Clock3 size={14} />~ {estimatedDuration(suggested)} min
            </span>
          </div>
          <div className="next-workout-footer">
            <p className="personal-message">
              {data.activeSession
                ? `${completedCount(data.activeSession)} exercices renseignés. Reprends à ton rythme.`
                : "Une suggestion, à adapter à ton rythme."}
            </p>
            <button
              className="button primary"
              onClick={() =>
                data.activeSession ? navigate("session") : onView(suggested.id)
              }
            >
              <Play size={15} />
              {data.activeSession
                ? "Reprendre ma séance"
                : "Préparer ma séance"}
            </button>
          </div>
        </section>
        <section className="panel week-panel">
          <div className="section-title compact">
            <h2>Ton rythme</h2>
            <span className="eyebrow">7 DERNIERS JOURS</span>
          </div>
          <div className="week-summary">
            <strong>{week.length}</strong>
            <span>
              séance{week.length > 1 ? "s" : ""} terminée
              {week.length > 1 ? "s" : ""}
              <small>Chaque effort compte.</small>
            </span>
            <Flame size={25} />
          </div>
          <div className="week-days">
            {days.map((d, i) => {
              const count = sessions.filter(
                (s) =>
                  new Date(s.startedAt).toDateString() === d.toDateString(),
              ).length;
              return (
                <div key={d.toISOString()} className={i === 6 ? "today" : ""}>
                  <span
                    className={`day-dot ${count ? "done" : ""}`}
                    aria-label={`${date(d)} : ${count} séance${count > 1 ? "s" : ""}`}
                  >
                    {count ? <Check size={15} /> : d.getDate()}
                  </span>
                  <span>
                    {new Intl.DateTimeFormat("fr-FR", { weekday: "short" })
                      .format(d)
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="muted small">
            {week.length
              ? "Continue à ton rythme. La régularité se construit."
              : "Ta prochaine séance sera le premier pas."}
          </p>
        </section>
      </div>
      <section className="stats-grid" aria-label="Résumé de tes entraînements">
        <div className="stat-card">
          <span className="stat-icon">
            <Dumbbell size={20} />
          </span>
          <div>
            <span>Séances terminées</span>
            <strong>
              {sessions.length}
              <small>depuis le début</small>
            </strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <Flame size={20} />
          </span>
          <div>
            <span>Exercices réalisés</span>
            <strong>
              {week.reduce((sum, session) => sum + completedCount(session), 0)}
              <small>sur les 7 derniers jours</small>
            </strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <TrendingUp size={20} />
          </span>
          <div>
            <span>Volume de la semaine</span>
            <strong>
              {number(weekVolume)}
              <small>kg soulevés estimés</small>
            </strong>
          </div>
        </div>
      </section>
      <div className="dashboard-bottom">
        <section className="panel last-session">
          <div className="section-title compact">
            <h2>Dernière séance</h2>
            <History size={18} />
          </div>
          {last ? (
            <>
              <span className="pill">{last.programId.toUpperCase()}</span>
              <h3>{date(last.startedAt)}</h3>
              <p className="muted">
                {completedCount(last)} exercices · {number(sessionVolume(last))}{" "}
                kg de volume
              </p>
              <button
                className="text-button"
                onClick={() => navigate("history")}
              >
                Retrouver mes performances <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="empty-mini">
                <History size={25} />
                <p>
                  Une page blanche.
                  <br />
                  <b>À toi d’écrire la suite.</b>
                </p>
              </div>
              <span className="muted small">
                Tes séances apparaîtront ici une fois terminées.
              </span>
            </>
          )}
        </section>
        <section className="panel progress-shortcut">
          <span className="stat-icon">
            <TrendingUp size={22} />
          </span>
          <div>
            <h2>Vois le chemin parcouru.</h2>
            <p className="muted small">
              Poids, répétitions, volume : retrouve tes repères séance après
              séance.
            </p>
          </div>
          <button className="text-button" onClick={() => navigate("progress")}>
            Ma progression <ArrowRight size={16} />
          </button>
        </section>
      </div>
      <p className="privacy-note">
        <ShieldCheck size={15} /> Tes données restent sur cet appareil. Pense à
        les exporter régulièrement.
      </p>
    </div>
  );
}
