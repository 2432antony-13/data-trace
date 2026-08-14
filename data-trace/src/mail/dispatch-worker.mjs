// src/mail/dispatch-worker.mjs
// 从 dispatch_runs 中取出 status='prepared' 的批次，逐条发送并回写 dispatch_messages 与 mail_log。

import { isMailConfigured, sendEmail } from './sender.mjs';
import { logMailResult } from '../server.mjs';

/**
 * 当某个 run 的全部消息都已进入终态（sent / skipped / 达到 maxAttempts 的 failed）时，
 * 收尾 dispatch_runs：全部失败记 'failed'，否则记 'completed'。
 */
function finalizeRunIfDone(db, runId, maxAttempts) {
  const messages = db.prepare('SELECT status, attempts FROM dispatch_messages WHERE dispatch_run_id=?').all(runId);
  const pending = messages.some(
    (message) => message.status === 'queued' || (message.status === 'failed' && message.attempts < maxAttempts)
  );
  if (pending) return;
  const allFailed = messages.length > 0 && messages.every((message) => message.status === 'failed');
  const status = allFailed ? 'failed' : 'completed';
  db.prepare('UPDATE dispatch_runs SET status=?, completed_at=? WHERE id=?').run(status, new Date().toISOString(), runId);
}

/**
 * 处理积压的发送队列。
 * 返回 { sent, failed, skipped } 计数。
 * 未配置邮件时消息保持 queued，仅打印提示。
 */
export async function drainQueue({ db, env, log = console, maxPerTick = 50, maxAttempts = 3 }) {
  const counts = { sent: 0, failed: 0, skipped: 0 };
  if (!isMailConfigured(env)) {
    log?.log?.('[dispatch-worker] mail not configured; prepared messages remain queued');
    return counts;
  }

  const runs = db.prepare("SELECT * FROM dispatch_runs WHERE status='prepared' ORDER BY created_at").all();
  for (const run of runs) {
    const messages = db.prepare(
      "SELECT * FROM dispatch_messages WHERE dispatch_run_id=? AND status IN ('queued','failed') AND attempts < ? ORDER BY created_at LIMIT ?"
    ).all(run.id, maxAttempts, maxPerTick);

    for (const message of messages) {
      const outcome = await sendEmail(env, {
        to: message.recipient,
        subject: message.subject,
        text: message.body,
        headers: { unsubscribeUrl: message.unsubscribe_url }
      });
      const ok = outcome.ok === true;
      const nowIso = new Date().toISOString();
      db.prepare('UPDATE dispatch_messages SET status=?, attempts=attempts+1, last_error=?, sent_at=? WHERE id=?').run(
        ok ? 'sent' : 'failed',
        ok ? null : String(outcome.result?.message || 'Email send failed.'),
        ok ? nowIso : message.sent_at,
        message.id
      );
      if (ok) counts.sent += 1;
      else counts.failed += 1;

      // 复用 mail-log 端点同款落库逻辑，把本次发送结果写入 mail_log。
      try {
        logMailResult(db, env, {
          subscriberId: message.subscriber_id,
          messageType: message.message_type,
          subject: message.subject,
          body: message.body,
          gatewayResult: {
            success: ok,
            messageId: outcome.result?.id || outcome.result?.messageId || null,
            message: outcome.result?.message
          }
        });
      } catch (error) {
        log?.error?.(`[dispatch-worker] mail_log write failed for ${message.id}: ${error?.message || error}`);
      }
    }

    finalizeRunIfDone(db, run.id, maxAttempts);
  }

  return counts;
}
