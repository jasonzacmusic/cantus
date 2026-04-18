# Cantus · Handoff to Claude Code

## What this is

Cantus is a web app for exploring chord voicings, built for **Nathaniel School of Music**. Students and musicians build chords from any of fourteen scales, in voicings from 2nds through 7ths. From any chord they navigate to related chords via intervallic moves, pin up to four chords to a pinboard, see which notes are shared, and hear the whole progression loop with an optional metronome. Two "surprise me" buttons fill the pinboard with proven classic and cinematic progressions that cycle each tap.

The accompanying `cantus.jsx` is a feature-complete interaction prototype built in the Claude artifact sandbox. Your job is to **port it into a proper Vite + React + TypeScript project, upgrade the audio from synth to real piano samples, and ship it to production on Vercel via a GitHub repo**. Then layer on pedagogy features (lesson mode, MIDI export, shareable URLs) that turn it from a demo into curriculum software.

**The user, Nathaniel, is not technical.** He should not have to run shell commands, manage SSH keys, click through GitHub UI, or touch a Vercel dashboard. Everything that can be automated should be automated by you.

---

## 🚨 DEPLOYMENT AUTOMATION — READ THIS FIRST

**The user must not have to do technical plumbing. Handle all of this for him:**

1. **Create the GitHub repo automatically.** Use the `gh` CLI (GitHub's command-line tool — already installed in most dev environments, or install with `brew install gh` / `apt install gh`). Run `gh auth login` once to authenticate with his GitHub account. Then `gh repo create <username>/cantus --public --source=. --push`. Ask him for the GitHub username or org to use. This creates the repo, sets the remote, and pushes the initial commit in one command.

2. **Connect Vercel to the repo automatically.** Install the Vercel CLI (`npm i -g vercel`). Run `vercel link` inside the project, choose "new project," select the GitHub repo you just pushed. Vercel auto-detects Vite and configures build command + output directory. From this point on, **every `git push` to main auto-deploys.**

3. **Set up the auto-deploy pipeline so it just works.** After `vercel link`:
   - Every push to `main` triggers a production deploy at `cantus.vercel.app` (or custom domain).
   - Every push to a PR branch triggers a preview deploy with a unique URL.
   - The user never touches Vercel's dashboard unless he wants to.

4. **If `gh` or `vercel` CLIs aren't available in your environment**, tell him exactly what to paste — one command at a time, with copy-paste blocks — and confirm each step worked before moving on. Don't dump a wall of instructions. Hand-hold.

5. **Git commit hygiene.** Commit after every meaningful milestone with clear conventional-commit messages. The user doesn't read commits but they're his audit trail.

6. **Custom domain (later).** If he wants `cantus.nathanielschoolofmusic.com` or similar, ask him, and add the CNAME via `vercel domains add`. Give him exact DNS records to paste into his domain registrar.

7. **Environment variables.** None needed for the current app. If you later add analytics, error tracking, or a backend, set them via `vercel env add` — never hardcoded.

8. **PWA + service worker.** Use `vite-plugin-pwa` with `registerType: 'autoUpdate'`. Cache the piano samples (~30 MB) aggressively — users shouldn't redownload them on every visit. Manifest should use the NSM logo at 192×192 and 512×512.

The user's stated requirement: *"I'm not a technical person. It should push to GitHub automatically and push to Vercel automatically. These things are really needed."* Treat this as a hard requirement, not a nice-to-have.

---

## Current artifact status

`cantus.jsx` is ~2,990 lines. Structure top-to-bottom:

1. **NSM_LOGO constant** — currently `null` (placeholder). The user wants you to add the real logo asset properly at `/public/nsm-logo.png` and update the header to render it from there. The placeholder code already conditionally renders a small "N" medallion when `NSM_LOGO` is null, so the app works without it.
2. **Music theory constants** — `SCALES` (14), `VOICINGS` (6), `START_DEGREES` (3), `INTERVAL_COLORS`, `MOVES` (21), `CLASSIC_PATTERNS` (10), `CINEMATIC_PATTERNS` (10)
3. **Helper functions** — `mod12`, `pitchName`, `voicingMidi`, `preferFlats`, etc.
4. **Piano component** — SVG, 2 octaves, with order badges (1/2/3 for single-chord view) and count badges (×N for combined-view)
5. **ScaleRibbon component** — SVG, shows current scale's notes with letter + scale degree
6. **Main Cantus component** — all state, derived values, action handlers, layout
7. **Card components** — `PinnedCard`, `BigMoveCard`, `SmallMoveCard`, `PinShortcut`
8. **LearnGuide** — 11-page in-app onboarding modal with illustrated SVG panels per page
9. **11 illustration components** — custom SVG artwork for each guide page

The audio layer uses Tone.js with a 2-voice layered setup (triangle main + sine pad) and a click synth for metronome. Everything else is inline styles with a small `<style>` block for animations and responsive grid classes.

---

## Design language — "Paper Lab"

An old scientific notebook: cream paper, aged purple ink, hand-drawn underlines, serif display type. Confident and personality-forward where most music-theory apps are cold and flat.

**Color tokens** (preserve these):

```ts
paper:   '#F6F1E7'  // background
paperD:  '#EDE5D0'  // card backgrounds
ink:     '#1F1E2E'  // body text
ink2:    '#524768'  // secondary text
teal:    '#2D5E6B'  // primary action (Pin, Play progression)
spice:   '#C64B3B'  // cinema mode, warning states
gold:    '#B88A2E'  // shared notes, active playback
muted:   '#8D846F'  // labels
line:    'rgba(31, 30, 46, 0.12)'  // dividers
```

Each scale has its own color in the `SCALES` constant — preserve them.

**Typography:**
- **Fraunces** (serif, variable axis) — display: chord names, headings. *Italic for minor/modal family, upright for major.* At-a-glance chord-quality signal.
- **Geist** (sans) — UI, buttons, body text
- **JetBrains Mono** — scale degrees, intervals, metadata

**Motifs:**
- Hand-drawn underline under each section label (`HandUnderline` SVG)
- SVG turbulence paper-grain overlay on the background
- Pin cards animate in with slight rotation (`pinIn` keyframe)
- NSM cursive monogram as a circular medallion stamp (when the real logo is added)
- Scale ribbon at the bottom with rounded-rect keys showing both the note letter AND scale degree

Don't sanitize the hand-drawn feel. Don't substitute Fraunces with a geometric sans. Don't reach for Tailwind defaults.

---

## Music theory model

All implemented. Port verbatim into a `theory/` module.

**Scales (14):** Major, Natural Minor, Dorian, Phrygian, Lydian, Mixolydian, Locrian, Harmonic Minor, Melodic Minor, Phrygian Dominant, Major Pentatonic, Minor Pentatonic, Blues, Whole Tone.

**Voicings (6):** 2nds, 3rds, 4ths, 5ths, 6ths, 7ths. Each defined by a `stepSize` that strides through the scale.

**Start degrees (3):** root, 3rd, 5th.

**Moves (21):**
- Primary (13): m3, M3, m6, M6, TT, P4, P5 — both directions (TT is direction-agnostic)
- Secondary (8): m2, M2, m7, M7 both directions

Each move has `hint` (poetic phrase) and `tip` (educational sentence with ancient music theory). Examples:
- `m3` — "the blue mediant" · "medieval 'imperfect consonance' · leads to the relative minor"
- `TT` — "diabolus in musica" · "medieval monks called this 'the devil' · perfectly symmetric, never settled"
- `P5` — "the purest pull" · "the dominant (V) · Pythagoras' 3:2 ratio · gravity of the key"

**Ancient references are deliberate.** Don't simplify.

**Classic progressions (10):** I–V–vi–IV, vi–IV–I–V, I–vi–IV–V (50s doo-wop), I–V–vi–iii, ii–V–I–vi (jazz turnaround), I–IV–V–I (hymn), vi–V–IV–V, I–iii–IV–V, I–IV–vi–V, I–V–IV–I. All voiced in 3rds. Each tap picks a different pattern in a random major key.

**Cinematic progressions (10):** Inception, Interstellar, Dark Knight, Zimmer Time, Pirates, Man of Steel, Gladiator, Tritone Drama, Arrival, Blade Runner. These are **non-diatonic chromatic-mediant** progressions — the jumps themselves (up a M3, down a m6, to ♭VI, to the tritone) create the filmic wonder/dread. Voiced in 4ths (quartal) with some 5ths mixed for textural variety. Each tap picks a different pattern in a random key.

---

## Interaction model

### Silent navigation, explicit playback

**Only three buttons produce sound:** Hear it, Bloom, Ripple. Everything else — piano keys, scale picker, voicing picker, Follow-a-Branch cards, loading a pin, major↔minor flip — updates state silently. Navigation without noise. This is a deliberate user request. Preserve.

### Three playback patterns

- **Hear it** — block chord with ~22ms strum, pad sustains.
- **Bloom** — each note enters and stays, stacking bottom-up.
- **Ripple** — palindromic arpeggio (low→high→low) then soft block chord.

### Progression playback — grid-aligned, loops forever

The current `playProgression` uses a **fixed tempo grid**:
- 82 BPM, 4 beats per chord (`CHORD_DUR = 2.93s`)
- Metronome ticks and chord events schedule against the same `audioTime` anchor → they **never drift**
- Loops via `progressionLoopIdxRef.current % pinsSnap.length`
- Each `step` reads `pinsData` fresh, so reordering mid-playback picks up at the next chord without stutter
- `stopProgression` cancels the next scheduled step AND releases sustained notes immediately

Preserve this architecture. When you upgrade to real samples, keep the scheduling logic — just swap the synth for the Sampler.

### The pinboard

Pin up to 4 chords. Interval badges between neighbors. Combined keyboard below shows all notes from all pinned chords, with notes that appear in ≥2 chords colored **gold** and annotated with a `×N` count badge.

**Voice-leading as visual.** Gold keys = shared tones = smooth voice leading. Purple keys = unique to one chord. The ×N tells the student exactly how strong each thread is. This is pedagogically the whole point of Cantus.

Pin cards support ← / → reordering. Fresh pins animate with `pinFlash`. Clicking loads silently. × removes.

### Surprise-me generators

Two buttons under the pinboard, always visible:
- **Classic** — cycles through 10 diatonic progressions
- **Cinematic** — cycles through 10 non-diatonic chromatic-mediant progressions

Each has a ref (`classicIdxRef`, `cinematicIdxRef`) that guarantees consecutive taps produce different patterns. The key randomizes each tap too.

### TOUR (formerly Cinema)

Silent visual tour, 18 scenes in 5 acts, auto-starts once on page load after 700ms. Re-triggerable via TOUR button in the header. Always silent.

### Learn guide

11-page modal via LEARN button in the header. Two-column on desktop (illustration left, text right), stacks on mobile. Pages: Welcome → Big Letter → Keyboard → Three Playbacks → Voicings → Scales → Follow a Branch → Pinboard → Shared Notes (Voice Leading) → Shortcuts → Finale. Custom SVG illustrations throughout.

---

## Audio architecture

### Current (sandbox-constrained)

- **Main voice** — `PolySynth(Tone.Synth)` triangle, -5 dB
- **Pad voice** — `PolySynth(Tone.Synth)` sine, octave below, -17 dB
- **Click synth** — single `Tone.Synth` sine for metronome

Created lazily on first user gesture via `initAudio()` behind a promise ref.

### Target (real app)

**Step 1 — Piano samples.** Replace main `PolySynth` with `Tone.Sampler` loaded from [Salamander Grand Piano](https://github.com/sfzinstruments/SalamanderGrandPiano) (CC0, ~30 MB, velocity-layered). Self-host in `/public/samples/piano/`.

**Step 2 — Reverb.** Convolution reverb with IR at `/public/ir/hall.wav`. Signal chain:
```
main Sampler ──┐
               ├─→ reverb (wet: 0.22) ─→ destination
pad Synth ─────┘
click Synth ─→ destination (dry, no reverb)
```
**Critical bug to avoid:** `await reverb.generate()` BEFORE connecting anything. Connect first and the signal silently dies with no error.

**Step 3 — Cello drone (optional).** An earlier version had one. User liked it.

**Step 4 — Instrument switcher (nice-to-have).** Piano / Rhodes / Strings / Organ.

### Audio loading UX

Show "tuning the piano…" loader while samples download. Disable playback buttons until ready. Cache samples in service worker.

---

## Target project structure

```
cantus/
├── public/
│   ├── samples/piano/       # Salamander samples
│   ├── ir/hall.wav          # reverb IR
│   ├── icons/               # PWA icons
│   ├── nsm-logo.png         # ask Nathaniel
│   └── manifest.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── theory/
│   │   ├── scales.ts
│   │   ├── voicings.ts
│   │   ├── moves.ts
│   │   ├── progressions.ts    # CLASSIC_PATTERNS + CINEMATIC_PATTERNS
│   │   ├── chord.ts
│   │   └── types.ts
│   ├── audio/
│   │   ├── engine.ts
│   │   ├── progression.ts     # grid scheduler
│   │   ├── metronome.ts
│   │   └── samples.ts
│   ├── components/
│   │   ├── Piano.tsx
│   │   ├── ScaleRibbon.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── NoteCards.tsx
│   │   ├── ActionRow.tsx
│   │   ├── Pinboard/
│   │   ├── ChordPicker.tsx
│   │   ├── FollowBranch/
│   │   ├── Cinema.tsx
│   │   ├── LearnGuide/
│   │   └── ScaleReference.tsx
│   ├── state/useAppState.ts
│   ├── sharing/
│   │   ├── urlEncode.ts
│   │   └── midiExport.ts
│   ├── styles/tokens.ts
│   └── assets/
├── index.html
├── vite.config.ts             # with vite-plugin-pwa
├── vercel.json
└── README.md
```

Don't use Redux. Keep the state as-is or lift to Zustand.

---

## Roadmap

### Milestone 1 — Port + real audio + DEPLOY (1–2 days)

1. `pnpm create vite cantus --template react-ts`
2. Install: `tone`, `lucide-react`, `@tonejs/midi`, `vite-plugin-pwa`
3. Split `cantus.jsx` into the file structure above
4. Replace main PolySynth with Tone.Sampler + Salamander samples
5. Add convolution reverb with IR file
6. Show sample-loading UX
7. **Push to GitHub via `gh repo create` → Vercel link → verify auto-deploy works.** Done when every `git push` to main produces a live URL update without user intervention.

### Milestone 2 — PWA polish (½ day)

1. `vite-plugin-pwa` with `autoUpdate`
2. Manifest + icons derived from NSM logo
3. Cache samples in service worker
4. Test install on iPad, iPhone, Android, desktop

### Milestone 3 — Sharing + MIDI export (1 day)

1. Encode pinboard in URL hash
2. Parse on app load
3. Share-link button → clipboard
4. MIDI export via `@tonejs/midi`

### Milestone 4 — Pedagogy features (2–3 days)

1. **Lesson mode** — scripted JSON sequences
2. **Ear training** — identify chord by ear
3. **Classroom broadcast** — teacher pushes state to student devices via Firebase/Supabase

### Milestone 5 — Polish

Dark mode, keyboard shortcuts, `prefers-reduced-motion`, screen reader support, drag-and-drop pinboard, tempo slider, instrument switcher, PDF handouts.

---

## Decisions worth preserving

- **Priority intervals are 3rds, 6ths, TT, 4ths, 5ths** — primary tier. Big cards.
- **Ancient-theory interval descriptions.** Don't simplify.
- **Move cards have 3 actions:** chord name navigates; `↔ G` link flips major↔minor; `+` pins destination without navigating.
- **Main piano has 1/2/3 order badges** (voicing order); combined pinboard piano has ×N badges (shared-chord count).
- **Minor italic, major upright.** Quality signal.
- **TOUR is always silent, 18 scenes, 5 acts, auto-starts once.**
- **Pinboard caps at 4 chords.**
- **Pinning and pin-loading are both silent.**
- **Progression playback loops forever, grid-aligned, reorder-safe.**
- **Metronome is locked to the chord grid.** Cannot drift.
- **Surprise-me buttons cycle.** Refs guarantee consecutive taps differ.
- **Main piano: root is coral, voicing purple. Combined piano: shared gold, unique purple — no root coloring.**

---

## Open questions for Nathaniel

- **GitHub username / org?** For `gh repo create`.
- **Domain?** Start `cantus.vercel.app`, move to custom later?
- **Logo file?** He'll supply the clean PNG/SVG. Current JSX has `NSM_LOGO = null` with a placeholder "N" medallion.
- **Instrument switcher?** Piano / Rhodes / Strings / Organ.
- **Tempo slider for progressions?** Currently 82 BPM fixed.
- **Monetization?** Free / school license / per-student.
- **Analytics?** Plausible, Fathom, or nothing.

---

## Included files

- `HANDOFF.md` — this document
- `cantus.jsx` — the artifact source (~2,990 lines)

Logo is **not** included — ask Nathaniel for the clean file. The current JSX renders a placeholder "N" medallion when `NSM_LOGO` is null.

---

**Your north star:** Cantus exists because teachers like Nathaniel don't have tools like this. The artifact already works beautifully — your job is to ship it as a real product he can send to students with a single link, without him ever touching a terminal or a dashboard. Automate everything. Hand-hold where you can't. Good luck.
