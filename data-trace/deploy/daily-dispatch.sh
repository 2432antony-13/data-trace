#!/usr/bin/env bash
#
# DataTrace 每日简报调度脚本（供 crontab 调用）
#
# crontab 行（服务器本地时区为 Asia/Shanghai 时）：
#   0 8 * * *  /opt/datatrace/deploy/daily-dispatch.sh >> /var/log/datatrace-dispatch.log 2>&1
# 若服务器系统时区为 UTC，可显式指定时区：
#   0 8 * * *  TZ=Asia/Shanghai /opt/datatrace/deploy/daily-dispatch.sh >> /var/log/datatrace-dispatch.log 2>&1
#
# 说明：应用要求 scheduledAt 为北京时间 08:00，即 UTC 当天 00:00。
# 因此无论服务器时区如何，都用 date -u 计算「今天」的 UTC 00:00 作为 scheduledAt。
# 接口幂等：同一天重复触发会返回 alreadyPrepared:true，脚本将其视为成功。

set -euo pipefail

: "${DISPATCH_URL:?请在环境中设置 DISPATCH_URL（例如 https://your-domain.example.com）}"
: "${DISPATCH_API_KEY:?请在环境中设置 DISPATCH_API_KEY}"

# 当天 UTC 00:00 的 ISO 时间戳（对应北京时间 08:00）
SCHEDULED_AT="$(date -u +%Y-%m-%dT00:00:00Z)"
BODY="$(printf '{"messageType":"daily_briefing","scheduledAt":"%s"}' "${SCHEDULED_AT}")"

RESP_FILE="$(mktemp)"
trap 'rm -f "${RESP_FILE}"' EXIT

HTTP_CODE="$(curl -sS -o "${RESP_FILE}" -w '%{http_code}' \
  -X POST "${DISPATCH_URL%/}/api/dispatch/messages" \
  -H 'content-type: application/json' \
  -H "x-dispatch-key: ${DISPATCH_API_KEY}" \
  -d "${BODY}")"

RESPONSE="$(cat "${RESP_FILE}")"

if [[ "${HTTP_CODE}" =~ ^2 ]]; then
  echo "dispatch ok (${HTTP_CODE}): ${RESPONSE}"
  exit 0
fi

# 幂等响应（alreadyPrepared）视为成功；正常情况下接口以 200 返回，
# 此处兜底处理上游在极端情况下以非 2xx 返回幂等提示的情形。
if printf '%s' "${RESPONSE}" | grep -qE '"alreadyPrepared"[[:space:]]*:[[:space:]]*true'; then
  echo "dispatch already prepared (idempotent): ${RESPONSE}"
  exit 0
fi

echo "dispatch failed (${HTTP_CODE}): ${RESPONSE}" >&2
exit 1
