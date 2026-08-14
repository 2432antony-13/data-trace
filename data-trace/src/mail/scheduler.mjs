// src/mail/scheduler.mjs
// 定时调度器：
//  - 每个 tick 无条件 drainQueue，处理积压的 prepared 批次；
//  - 北京时间整点 08:00 准备当日 daily 简报（内部按幂等键去重）并交给 drainQueue 发送。

import { drainQueue } from './dispatch-worker.mjs';
import { beijingParts, prepareDailyDispatch } from '../server.mjs';

const TICK_MS = 60_000;

/**
 * 启动调度器，返回 stop() 用于停止。
 * 只在 server.mjs 主入口调用，createDataTraceServer 不自动启动（测试不受影响）。
 */
export function startScheduler({ db, env, log = console }) {
  const prefix = '[scheduler]';
  let stopped = false;

  async function tick() {
    try {
      const now = new Date();
      const { hour } = beijingParts(now);
      // 北京时间 08:00：准备当日 daily（幂等键保证同一天只准备一次）。
      if (hour === 8) {
        const prepared = prepareDailyDispatch({ db, env, now });
        if (!prepared.alreadyPrepared) log?.log?.(`${prefix} prepared daily briefing run ${prepared.runId}`);
      }
      // 无条件处理积压（含 endpoint 手动准备的 run）。
      const result = await drainQueue({ db, env, log });
      if (result.sent || result.failed || result.skipped) {
        log?.log?.(`${prefix} drained sent=${result.sent} failed=${result.failed} skipped=${result.skipped}`);
      }
    } catch (error) {
      log?.error?.(`${prefix} tick failed: ${error?.message || error}`);
    }
  }

  const timer = setInterval(tick, TICK_MS);
  timer.unref?.();
  // 启动时先跑一次，尽快消化积压。
  void tick();

  return function stop() {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
  };
}
