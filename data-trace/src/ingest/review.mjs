// 审校 CLI（零依赖，process.argv，中文输出）。
// 命令：list | approve <id> | reject <id> | edit <id> [--title=] [--summaryEn=] [--summaryZh=] [--importance=high|medium|low]
// 可选 --database <path>（或用环境变量 DATABASE_PATH；默认 data/data-trace.sqlite）。
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase } from '../db.mjs';

const VALID_IMPORTANCE = new Set(['high', 'medium', 'low']);

// 解析 argv：既支持 --flag=value，也支持 --flag value（下一项非 -- 开头则作为值）。
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

// 对已打开的 db 执行审校命令，返回 { output, ok }。测试可直接注入 db 调用。
export function runReview(db, argv) {
  const { flags, positional } = parseArgs(argv);
  const command = positional[0];
  const id = positional[1];
  const now = new Date().toISOString();

  if (command === 'list') {
    const rows = db.prepare(
      "SELECT id, title, event_date, source_name FROM updates WHERE status='pending_review' ORDER BY event_date DESC, id"
    ).all();
    if (rows.length === 0) return { output: '没有待审校的记录。', ok: true };
    const lines = rows.map((r) => `${r.id}\t${r.event_date}\t${r.source_name}\t${r.title}`);
    return { output: ['待审校记录（status=pending_review）：', ...lines].join('\n'), ok: true };
  }

  if (command === 'approve' || command === 'reject') {
    if (!id) return { output: `用法：node src/ingest/review.mjs ${command} <id> [--database <path>]`, ok: false };
    const target = command === 'approve' ? 'published' : 'retracted';
    const result = db.prepare(
      "UPDATE updates SET status=?, updated_at=? WHERE id=? AND status='pending_review'"
    ).run(target, now, id);
    if (result.changes === 0) return { output: `未找到待审校记录 ${id}（可能不存在或已被处理）。`, ok: false };
    const label = command === 'approve' ? '批准（published）' : '驳回（retracted）';
    return { output: `已${label}：${id}`, ok: true };
  }

  if (command === 'edit') {
    if (!id) {
      return {
        output: '用法：node src/ingest/review.mjs edit <id> [--title=] [--summaryEn=] [--summaryZh=] [--importance=high|medium|low]',
        ok: false
      };
    }
    const sets = [];
    const values = [];
    const fields = [];
    if (flags.title !== undefined) { sets.push('title=?'); values.push(flags.title); fields.push('title'); }
    if (flags.summaryEn !== undefined) { sets.push('summary=?'); values.push(flags.summaryEn); fields.push('summary'); }
    if (flags.summaryZh !== undefined) { sets.push('summary_zh=?'); values.push(flags.summaryZh); fields.push('summary_zh'); }
    if (flags.importance !== undefined) {
      if (!VALID_IMPORTANCE.has(flags.importance)) {
        return { output: `importance 只能是 high/medium/low，收到：${flags.importance}`, ok: false };
      }
      sets.push('importance=?');
      values.push(flags.importance);
      fields.push('importance');
    }
    if (sets.length === 0) return { output: '没有提供任何要更新的字段（--title/--summaryEn/--summaryZh/--importance）。', ok: false };
    sets.push('updated_at=?');
    values.push(now);
    const result = db.prepare(`UPDATE updates SET ${sets.join(', ')} WHERE id=?`).run(...values, id);
    if (result.changes === 0) return { output: `未找到记录 ${id}。`, ok: false };
    return { output: `已更新记录：${id}（字段：${fields.join('、')}）`, ok: true };
  }

  return {
    output: '未知命令。可用：list | approve <id> | reject <id> | edit <id> [--title= --summaryEn= --summaryZh= --importance=high|medium|low]',
    ok: false
  };
}

// CLI 入口：仅当直接以 node 运行本文件时执行。
function isMain() {
  return process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const { flags } = parseArgs(process.argv.slice(2));
  const db = openDatabase(flags.database || process.env.DATABASE_PATH);
  const { output, ok } = runReview(db, process.argv.slice(2));
  console.log(output);
  db.close();
  process.exitCode = ok ? 0 : 1;
}
