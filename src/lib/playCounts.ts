// Firestore-backed play counter. Shared across the "Rhythm_game" family of
// sibling projects (rythm-game-mo Firebase project) — this repo's slice is
// the single document playCounts/puyo. No Firebase SDK, plain fetch() only,
// to match the reference implementation ported verbatim from Rhythm_game's
// PlayCounts module (see CLAUDE.md).

const PROJECT_ID = 'rythm-game-mo';
const API_KEY = 'AIzaSyBBo4f_LqJ2lfdKu8Q11oeiiYq_O-15LSc';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const GAME_ID = 'puyo';

/**
 * Fire on every fresh game start (title -> falling, and retry after game
 * over). Never blocks gameplay — fire-and-forget, errors are swallowed
 * (logged only) since there is no loading/error UI for this.
 *
 * Tries the atomic +1 first (the steady-state case, one request). If that
 * fails because the document doesn't exist yet, falls back to creating it
 * with count: 1 — the security rule only allows create when the new
 * document is exactly { count: 1 }, so a brand-new game id self-registers
 * with zero manual setup.
 */
export function incrementPlayCount(): void {
  const commitUrl = `${ROOT}:commit?key=${API_KEY}`;
  const docPath = `projects/${PROJECT_ID}/databases/(default)/documents/playCounts/${encodeURIComponent(GAME_ID)}`;

  const incrementBody = {
    writes: [
      {
        transform: {
          document: docPath,
          fieldTransforms: [{ fieldPath: 'count', increment: { integerValue: '1' } }],
        },
      },
    ],
  };

  const createBody = {
    writes: [
      {
        update: { name: docPath, fields: { count: { integerValue: '1' } } },
        currentDocument: { exists: false },
      },
    ],
  };

  fetch(commitUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incrementBody),
  })
    .then((res) => {
      if (res.ok) return;
      return fetch(commitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createBody),
      });
    })
    .catch((e) => {
      console.warn('playCount increment failed:', e);
    });
}

/**
 * Fetches the current play count for display (e.g. on the title screen).
 * Read-only GET on the single playCounts/puyo document — no SDK, no batch/
 * query, since this repo only ever needs its own one document.
 *
 * Resolves to null if the document doesn't exist yet (nobody has played
 * since this feature shipped) or on any error — callers should just render
 * nothing in that case rather than a loading state or error message.
 */
interface FirestoreCountDoc {
  fields?: { count?: { integerValue?: string } };
}

export async function fetchCount(): Promise<number | null> {
  const url = `${ROOT}/playCounts/${encodeURIComponent(GAME_ID)}?key=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const doc: FirestoreCountDoc = await res.json();
    if (!doc.fields?.count?.integerValue) return null;
    return parseInt(doc.fields.count.integerValue, 10);
  } catch (e) {
    console.warn('playCount fetch failed:', e);
    return null;
  }
}
