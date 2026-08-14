#!/usr/bin/env bash
#
# DataTrace SQLite 备份脚本
# 依赖：bash、Node.js >= 22.5（内置 node:sqlite，无需 sqlite3 CLI）
#
# 用法：
#   DATA_DIR=/path/to/data ./backup.sh
#   默认 DATA_DIR 为脚本所在目录的 ../data（即项目 data 目录）。
#   备份写入 ${DATA_DIR}/backups/，默认保留最近 14 份（可用 KEEP= 覆盖）。
#
# 可选：备份完成后上传到阿里云 OSS 或 AWS S3（示例，需自行配置密钥/签名）：
#   # 阿里云 OSS（使用已签名的 PUT URL）：
#   curl -sS -X PUT "https://<bucket>.<region>.aliyuncs.com/backups/<文件名>" \
#     -H "Content-Type: application/octet-stream" --data-binary @"<备份文件绝对路径>"
#   # AWS S3（使用预签名 URL）：
#   curl -sS -X PUT "<presigned-url>" --upload-file "<备份文件绝对路径>"
#
# crontab 示例（每天 02:00 备份）：
#   0 2 * * *  /opt/datatrace/deploy/backup.sh >> /var/log/datatrace-backup.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="${DATA_DIR:-${SCRIPT_DIR}/../data}"
# 规范化路径（若目录尚不存在则保留原值，稍后统一报错）
if [[ -d "${DATA_DIR}" ]]; then
  DATA_DIR="$(cd "${DATA_DIR}" && pwd)"
fi
DB_FILE="${DATA_DIR}/data-trace.sqlite"
BACKUP_DIR="${DATA_DIR}/backups"
KEEP="${KEEP:-14}"

if [[ ! -f "${DB_FILE}" ]]; then
  echo "backup: 未找到数据库文件 ${DB_FILE}" >&2
  exit 2
fi

mkdir -p "${BACKUP_DIR}"

# 用 node 内置 node:sqlite 执行 VACUUM INTO 生成一致性快照备份（sqlite3 CLI 未必存在）。
# node -e 默认按 CommonJS 求值；脚本内避免单引号/模板字符串，以免与 bash 单引号冲突。
node -e '
  const { DatabaseSync } = require("node:sqlite");
  const fs = require("node:fs");
  const path = require("node:path");

  const args = process.argv.slice(1);
  const src = args[0];
  const destDir = args[1];
  const keep = Math.max(1, Number.parseInt(args[2] || "14", 10));

  if (!fs.existsSync(src)) {
    console.error("backup: 数据库不存在: " + src);
    process.exit(2);
  }
  fs.mkdirSync(destDir, { recursive: true });

  // 时间戳：2026-08-13T12-34-56-789Z（含毫秒，避免同秒冲突，且可按字典序排序）
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(destDir, "data-trace-" + stamp + ".sqlite");

  // 用 String.fromCharCode(39) 构造单引号，避免在 bash 单引号内出现字面单引号
  const SQ = String.fromCharCode(39);
  const escaped = dest.split(SQ).join(SQ + SQ);

  const db = new DatabaseSync(src);
  try {
    db.exec("VACUUM INTO " + SQ + escaped + SQ);
    console.log("backup: 已生成 " + dest);
  } finally {
    db.close();
  }

  // 仅保留最近 keep 份（按文件名字典序即时间顺序，删除最旧的）
  const backups = fs.readdirSync(destDir)
    .filter(function (name) { return /^data-trace-.*\.sqlite$/.test(name); })
    .sort();
  while (backups.length > keep) {
    const victim = path.join(destDir, backups.shift());
    fs.unlinkSync(victim);
    console.log("backup: 已清理过期备份 " + victim);
  }
' "${DB_FILE}" "${BACKUP_DIR}" "${KEEP}"

echo "backup: 完成，保留最近 ${KEEP} 份。"
