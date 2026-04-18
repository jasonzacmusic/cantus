import type { ProgressionPattern } from './types';

// CLASSIC: traditional diatonic progressions voiced in 3rds.
// Each pattern: [semitones_from_tonic, quality ('M'|'m')]
export const CLASSIC_PATTERNS: ProgressionPattern[] = [
  // I–V–vi–IV · "Axis of Awesome" · pop/hymn/praise
  { label: 'I–V–vi–IV',     steps: [[0,'M'], [7,'M'], [9,'m'], [5,'M']] },
  // vi–IV–I–V · Zombie, Someone Like You
  { label: 'vi–IV–I–V',     steps: [[9,'m'], [5,'M'], [0,'M'], [7,'M']] },
  // I–vi–IV–V · "50s doo-wop" · Earth Angel, Stand By Me
  { label: 'I–vi–IV–V',     steps: [[0,'M'], [9,'m'], [5,'M'], [7,'M']] },
  // I–V–vi–iii · classic pop variation
  { label: 'I–V–vi–iii',    steps: [[0,'M'], [7,'M'], [9,'m'], [4,'m']] },
  // ii–V–I–vi · jazz turnaround
  { label: 'ii–V–I–vi',     steps: [[2,'m'], [7,'M'], [0,'M'], [9,'m']] },
  // I–IV–V–I · hymn / 12-bar
  { label: 'I–IV–V–I',      steps: [[0,'M'], [5,'M'], [7,'M'], [0,'M']] },
  // vi–V–IV–V · Cry Me a River, Stairway
  { label: 'vi–V–IV–V',     steps: [[9,'m'], [7,'M'], [5,'M'], [7,'M']] },
  // I–iii–IV–V · Every Breath You Take, classic ballad
  { label: 'I–iii–IV–V',    steps: [[0,'M'], [4,'m'], [5,'M'], [7,'M']] },
  // I–IV–vi–V · More Than a Feeling
  { label: 'I–IV–vi–V',     steps: [[0,'M'], [5,'M'], [9,'m'], [7,'M']] },
  // I–V–IV–I · gospel/country
  { label: 'I–V–IV–I',      steps: [[0,'M'], [7,'M'], [5,'M'], [0,'M']] },
];

// CINEMATIC: non-diatonic chromatic-mediant progressions — the Zimmer vocabulary.
// Chord moves that don't belong to a single key; the jumps themselves (up a M3,
// down a m6, to the ♭VI, to the tritone) create the filmic wonder/dread/suspense.
export const CINEMATIC_PATTERNS: ProgressionPattern[] = [
  // Inception "Dream is Collapsing" · minor → ♭VI → ♭III → ♭VII (all minor)
  { label: 'Inception',       steps: [[0,'m'], [8,'m'], [3,'m'], [10,'m']] },
  // Interstellar main theme · I → ↑M3 → ↓m3 → home (major chromatic mediants)
  { label: 'Interstellar',    steps: [[0,'M'], [4,'M'], [0,'M'], [8,'M']] },
  // Dark Knight / Batman · i → ↑M3 → ↓M2 → ♭VI (minor mediant + chromatic)
  { label: 'Dark Knight',     steps: [[0,'m'], [4,'M'], [2,'M'], [8,'M']] },
  // Zimmer "Time" · i → ♭VI → ♭III → ♭VII — descending cycle of mediants
  { label: 'Time',            steps: [[0,'m'], [8,'M'], [3,'M'], [10,'M']] },
  // Pirates "He's a Pirate" · i → ♭VII → ♭VI → V (Andalusian + major V)
  { label: 'Pirates',         steps: [[0,'m'], [10,'M'], [8,'M'], [7,'M']] },
  // Man of Steel · I → ♭III → ♭VI → I  (double chromatic mediant)
  { label: 'Man of Steel',    steps: [[0,'M'], [3,'M'], [8,'M'], [0,'M']] },
  // Gladiator "Now We Are Free" · i → ♭VII → ♭VI → ♭VII (Dorian grandeur)
  { label: 'Gladiator',       steps: [[0,'m'], [10,'M'], [8,'M'], [10,'M']] },
  // Tritone drama · i → ♭V (tritone) → ♭VI → V — pure filmic tension
  { label: 'Tritone Drama',   steps: [[0,'m'], [6,'M'], [8,'M'], [7,'M']] },
  // Arrival / Villeneuve · i → ↑M3(major) → ↑m3(minor) → ♭VI
  { label: 'Arrival',         steps: [[0,'m'], [4,'M'], [7,'m'], [8,'M']] },
  // Blade Runner 2049 · i → ♭III → V → ♭VI · suspended uncertainty
  { label: 'Blade Runner',    steps: [[0,'m'], [3,'m'], [7,'M'], [8,'m']] },
];

// Classic progressions play in common major keys (C, D, E, F, G, A, B)
export const CLASSIC_KEYS = [60, 62, 64, 65, 67, 69, 71];

// Cinematic roots span a wider, darker set
export const CINEMATIC_ROOTS = [57, 58, 59, 60, 61, 62, 63, 64, 65];

// Voicing plans for cinematic: mix quartal (4ths) and quintal (5ths) voicings
// across the four chords, varied per run for textural variety.
export const CINEMATIC_VOICING_PLANS: Array<Array<[string, string]>> = [
  [['fourths', 'root'], ['fourths', 'root'], ['fourths', 'third'], ['fourths', 'third']],
  [['fourths', 'root'], ['fourths', 'third'], ['fourths', 'root'], ['fourths', 'third']],
  [['fourths', 'root'], ['fourths', 'third'], ['fourths', 'third'], ['fourths', 'root']],
  [['fifths',  'root'], ['fourths', 'root'], ['fourths', 'third'], ['fifths',  'root']],
];
