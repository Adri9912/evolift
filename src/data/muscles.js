// Repères anatomiques simplifiés, dessinés pour Evolift (aucun visuel externe copié).
// Chaque tracé représente le côté gauche ; le composant dessine aussi son miroir.
export const musclePaths = {
  front: [
    ["front-delts", "M53 58 C44 59 39 66 36 78 L44 83 C48 75 53 72 57 71 Z"],
    [
      "side-delts",
      "M44 62 C38 67 34 75 32 83 L36 86 L44 78 C45 72 46 68 48 65 Z",
    ],
    [
      "upper-chest",
      "M55 62 C62 60 70 60 78 64 L78 72 C69 69 61 70 53 74 L49 70 Z",
    ],
    ["chest", "M53 75 C62 71 71 72 78 74 L78 86 C69 91 59 89 53 83 L48 77 Z"],
    [
      "biceps",
      "M36 85 C40 83 44 85 43 92 C42 101 37 109 32 112 L29 108 C30 100 32 91 36 85 Z",
    ],
    [
      "brachialis",
      "M44 91 C46 100 39 114 33 119 L30 115 C36 110 40 101 41 95 Z",
    ],
    [
      "forearms",
      "M29 116 C34 116 36 119 32 130 L23 151 L17 149 C20 137 23 124 29 116 Z",
    ],
    [
      "abs",
      "M68 93 L78 92 L78 105 L68 105 Z M68 108 L78 108 L78 120 L68 120 Z M69 123 L78 123 L78 136 L70 133 Z M70 137 L78 140 L78 154 L73 148 Z",
    ],
    ["obliques", "M56 91 L65 95 L65 119 L69 140 L59 131 L54 108 Z"],
    [
      "quadriceps",
      "M53 162 C61 157 69 164 73 178 L73 209 C72 218 68 228 63 233 L56 229 C52 210 48 185 53 162 Z",
    ],
    ["adductors", "M72 165 L78 179 L76 207 L70 217 L73 188 Z"],
    [
      "shins",
      "M57 242 L64 243 C69 257 66 281 64 302 L56 302 C56 282 51 258 57 242 Z",
    ],
  ],
  back: [
    ["upper-back", "M70 49 L78 49 L78 112 L63 94 L50 72 L57 61 Z"],
    ["upper-back", "M53 78 L64 92 L75 113 L60 109 L52 94 Z"],
    ["rear-delts", "M52 60 C44 60 39 66 35 78 L45 85 L55 74 Z"],
    ["side-delts", "M43 63 C37 69 34 76 32 84 L36 86 L43 78 L47 68 Z"],
    [
      "triceps",
      "M36 87 L44 88 C46 99 39 112 32 118 L27 111 C29 102 32 93 36 87 Z",
    ],
    [
      "forearms",
      "M27 120 L33 123 C32 132 26 145 23 152 L17 150 C20 138 22 126 27 120 Z",
    ],
    ["lats", "M51 89 L59 107 L75 116 L67 135 L58 144 L55 124 Z"],
    ["lower-back", "M76 117 L78 117 L78 155 L62 149 L69 139 Z"],
    [
      "glutes",
      "M57 153 C65 148 72 153 78 161 L78 179 C71 187 60 189 51 181 L50 169 Z",
    ],
    [
      "hamstrings",
      "M52 187 C59 193 69 190 76 184 L73 211 L68 235 L60 233 C54 218 51 201 52 187 Z",
    ],
    ["calves", "M57 244 C51 256 52 275 59 284 L64 285 C72 269 71 253 66 245 Z"],
    ["achilles", "M59 287 L65 287 L64 304 L57 304 Z"],
  ],
};

// Les zones colorées correspondent au muscle principal indiqué sur la carte.
export const exerciseMuscles = {
  "pec-fly": ["chest", "upper-chest"],
  "chest-press": ["chest", "upper-chest"],
  "incline-press": ["upper-chest"],
  "lateral-raise": ["side-delts"],
  "rope-pushdown": ["triceps"],
  "ez-extension": ["triceps"],
  "lat-pulldown": ["lats"],
  "cable-row": ["lats", "upper-back"],
  "incline-row": ["lats"],
  "rear-fly": ["rear-delts"],
  "ez-curl": ["biceps"],
  "hammer-curl": ["brachialis"],
  "leg-curl": ["hamstrings"],
  "leg-extension": ["quadriceps"],
  "leg-press": ["quadriceps"],
  "romanian-deadlift": ["hamstrings"],
  "calf-raise": ["calves"],
};
