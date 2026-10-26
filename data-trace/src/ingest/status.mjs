import { hkSources } from './sources/hk.mjs';
import { sgSources } from './sources/sg.mjs';

// A zero-match extraction cannot distinguish no news from a changed page/parser.
// Preserve the previous successful observation when a later check fails or is empty.
export function getSourceStatus(db, previous = { sources: [] }) {
  const latest = db.prepare('SELECT * FROM ingestion_runs WHERE source_name=? ORDER BY started_at DESC, rowid DESC LIMIT 1');
  const successful = db.prepare("SELECT completed_at FROM ingestion_runs WHERE source_name=? AND status='succeeded' AND inserted_count+unchanged_count>0 ORDER BY completed_at DESC LIMIT 1");
  const sources = [...hkSources, ...sgSources].map((source) => {
    const old = previous.sources?.find((item) => item.code === source.code);
    const run = latest.get(source.name);
    if (!run) return old || { code: source.code, name: source.name, jurisdiction: source.jurisdiction,
      status: 'unknown', checkedAt: null, lastSuccessfulAt: null, inserted: 0, unchanged: 0 };
    return { code: source.code, name: source.name, jurisdiction: source.jurisdiction,
      status: run.status === 'succeeded' ? (run.inserted_count + run.unchanged_count > 0 ? 'available' : 'empty') : run.status,
      checkedAt: run.completed_at || run.started_at,
      lastSuccessfulAt: successful.get(source.name)?.completed_at || old?.lastSuccessfulAt || null,
      inserted: run.inserted_count, unchanged: run.unchanged_count };
  });
  return { sources, reviewMode: 'Automatic collection is not editorial approval.' };
}
