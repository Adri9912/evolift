import { exerciseMuscles, musclePaths } from "../data/muscles.js";

const outline = `M70 46 L70 52 C65 55 59 55 52 57
  C43 57 37 63 33 74 L25 99 L23 113 L14 141 L11 151
  L9 158 L8 169 Q9 173 11 169 L14 159 L14 173 Q16 176 17 172
  L19 160 L20 171 Q22 173 23 168 L25 154 L30 145 L39 124
  L43 111 L48 94 L53 88 L55 112 L58 134 L55 149
  C48 160 47 175 49 192 L51 218 L53 236
  C49 251 51 270 54 284 L53 303 L46 313 Q43 319 51 320
  L65 319 Q70 318 69 312 L67 301 L70 279 L72 259 L69 240
  L73 220 L77 201 L80 185
  L83 201 L87 220 L91 240 L88 259 L90 279 L93 301
  L91 312 Q90 318 95 319 L109 320 Q117 319 114 313 L107 303
  L106 284 C109 270 111 251 107 236 L109 218 L111 192
  C113 175 112 160 105 149 L102 134 L105 112 L107 88
  L112 94 L117 111 L121 124 L130 145 L135 154 L137 168
  Q138 173 140 171 L141 160 L143 172 Q144 176 146 173
  L146 159 L149 169 Q151 173 152 169 L151 158 L149 151
  L146 141 L137 113 L135 99 L127 74
  C123 63 117 57 108 57 C101 55 95 55 90 52 L90 46 Z`;
const head =
  "M80 8 C66 8 61 19 63 31 L66 41 Q71 50 80 51 Q89 50 94 41 L97 31 C99 19 94 8 80 8 Z";

function Body({ view, active }) {
  return (
    <svg
      viewBox="0 0 160 332"
      role="img"
      aria-label={view === "front" ? "Vue de face" : "Vue de dos"}
    >
      <g className="body-outline">
        <path d={outline} />
        <path d={head} />
      </g>
      {musclePaths[view].map(([id, path], index) => (
        <g key={`${id}-${index}`}>
          {[false, true].map((mirrored) => (
            <path
              key={String(mirrored)}
              d={path}
              transform={mirrored ? "translate(160 0) scale(-1 1)" : undefined}
              className={`body-muscle ${active.includes(id) ? "muscle-active" : ""}`}
              data-muscle={id}
            />
          ))}
        </g>
      ))}
      <g className="body-detail">
        {view === "front" ? (
          <>
            <path d="M80 63V156 M67 54L74 60 M93 54L86 60 M54 153L66 162L80 177L94 162L106 153 M56 235Q62 239 68 235 M92 235Q98 239 104 235 M61 180L64 213 M99 180L96 213" />
            <path d="M70 22Q72 17 78 17 M68 29L70 37L76 43 M92 29L90 37L84 43 M76 35Q80 37 84 35" />
          </>
        ) : (
          <path d="M80 52V155 M71 17Q80 13 89 17 M67 38Q80 44 93 38 M60 283L59 301 M100 283L101 301 M63 194L64 226 M97 194L96 226" />
        )}
      </g>
    </svg>
  );
}

export default function MuscleMap({ exercise }) {
  const active = exerciseMuscles[exercise.id] || [];
  return (
    <figure
      className="muscle-map"
      aria-label={`Repère musculaire : ${exercise.muscle}`}
    >
      <div className="muscle-map-heading">
        <span className="eyebrow">LA ZONE TRAVAILLÉE</span>
        <span className="muscle-map-tag">{exercise.muscle}</span>
      </div>
      <div className="muscle-map-bodies">
        {["front", "back"].map((view) => (
          <div key={view}>
            <Body view={view} active={active} />
            <span className="body-view-label">
              {view === "front" ? "FACE" : "DOS"}
            </span>
          </div>
        ))}
      </div>
      <figcaption>
        <span className="muscle-legend-dot" />
        Muscle principal mis en évidence
      </figcaption>
      <p className="muscle-map-note">
        Repère simplifié · Les muscles secondaires sont détaillés ci-dessous.
      </p>
    </figure>
  );
}
