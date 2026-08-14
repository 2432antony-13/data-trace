// 抓取 CLI：node src/ingest/run.mjs [--source hk|sg|hk,sg|<code>] [--dry-run] [--database <path>]
// dry-run 只打印不写库；结束打印每源 inserted/unchanged 汇总。
import { openDatabase } from '../db.mjs';
import { runIngest } from './pipeline.mjs';
import { hkSources } from './sources/hk.mjs';
import { sgSources } from './sources/sg.mjs';

const ALL_SOURCES = [...hkSources, ...sgSources];

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq >= 0) {
        flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      } else {
        const name = arg.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('--')) {
          flags[name] = next;
          i += 1;
        } else {
          flags[name] = true;
        }
      }
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

// 将 --source 值解析为源列表：支持 hk / sg / hk,sg / all / 具体 code。
function selectSources(sourceArg) {
  if (!sourceArg || sourceArg === 'all') return ALL_SOURCES;
  const wanted = new Set();
  for (const part of String(sourceArg).split(',')) {
    const p = part.trim();
    if (!p) continue;
    if (p === 'hk') hkSources.forEach((s) => wanted.add(s.code));
    else if (p === 'sg') sgSources.forEach((s) => wanted.add(s.code));
    else if (p === 'all') ALL_SOURCES.forEach((s) => wanted.add(s.code));
    else wanted.add(p);
  }
  return ALL_SOURCES.filter((s) => wanted.has(s.code));
}

async function main() {
  const { flags } = parseArgs(process.argv.slice(2));
  const sources = selectSources(flags.source);

  if (flags['dry-run']) {
    console.log('[dry-run] 只打印，不写库。');
    for (const source of sources) {
      console.log(`\n== ${source.code}（${source.name}）==`);
      try {
        const { items = [] } = await source.extract({ fetchFn: globalThis.fetch });
        for (const item of items) {
          console.log(`  - ${item.externalId}\t${item.date}\t${item.title}\t${item.url}`);
        }
        console.log(`  共 ${items.length} 条`);
      } catch (error) {
        console.log(`  抓取失败：${error.message}`);
      }
    }
    return;
  }

  const db = openDatabase(flags.database || process.env.DATABASE_PATH);
  try {
    const { results } = await runIngest({ db, fetchFn: globalThis.fetch, sources });
    console.log('抓取完成汇总：');
    for (const r of results) {
      const detail = r.error ? ` error=${r.error}` : '';
      console.log(`  ${r.code}: ${r.status} inserted=${r.inserted} unchanged=${r.unchanged}${detail}`);
    }
  } finally {
    db.close();
  }
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  main().catch((error) => {
    console.error('抓取运行崩溃：', error && error.message ? error.message : error);
    process.exitCode = 1;
  });
}
