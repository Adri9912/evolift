import { ArrowRight, Dumbbell } from "lucide-react";
import { estimatedDuration } from "../data/programs.js";
export default function ProgramCard({
  program,
  index,
  suggested,
  onStart,
  onView,
}) {
  return (
    <article
      className={`program-card program-${program.id} ${suggested ? "program-suggested" : ""}`}
    >
      <button
        className="program-cover"
        onClick={() => onView(program.id)}
        aria-label={`Voir le programme ${program.name}`}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/${program.id}.webp`}
          alt=""
          loading="lazy"
        />
        <span className="program-cover-icon">
          <Dumbbell size={23} strokeWidth={1.5} />
        </span>
        <span className="program-cover-copy">
          <span className="program-cover-title">{program.name}</span>
          <span className="program-cover-muscles">{program.muscles}</span>
          <span className="program-cover-meta">
            {program.exercises.length} exercices · ~{" "}
            {estimatedDuration(program)} min
          </span>
        </span>
        <span className="program-cover-arrow">
          <ArrowRight size={18} />
        </span>
      </button>
      <div className="program-card-bottom">
        <span className="program-caption">
          {suggested
            ? "Ta prochaine séance"
            : `Programme ${String(index + 1).padStart(2, "0")}`}
        </span>
        <button
          className="text-button program-start"
          onClick={() => onStart(program.id)}
        >
          Commencer <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}
