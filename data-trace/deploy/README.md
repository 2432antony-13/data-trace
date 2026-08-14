# DataTrace 部署与运维指南

本目录（data-trace/deploy/）集中放置生产部署与运维资产，配合 data-trace/ 下的
Dockerfile、docker-compose.yml、Caddyfile 以及仓库根目录的 .github/workflows/ 使用。

## 1. 架构（文字版）

    访客浏览器（大陆 / 海外）
           │  HTTPS 443
           ▼
    ┌────────────────────────────────────────────┐
    │  Caddy 反向代理（自动 HTTPS / 证书自动续期）  │
    │  · gzip / zstd 压缩                         │
    │  · 安全响应头（双层防御之一）                 │
    └──────────────────────┬─────────────────────┘
                           │  reverse_proxy app:3000
                           ▼
    ┌────────────────────────────────────────────┐
    │  DataTrace 应用（Node 22 内置 node:sqlite）  │
    │  · 零第三方运行时依赖                         │
    │  · GET  /api/health              健康检查    │
    │  · POST /api/dispatch/messages    每日简报触发│
    └──────────────────────┬─────────────────────┘
                           │
                           ▼
    ┌────────────────────────────────────────────┐
    │  SQLite 数据文件 data-trace.sqlite           │
    │  · Docker：命名卷 app-data 挂载到 /app/data  │
    │  · 裸机：/var/lib/datatrace（见第 2.2 节）    │
    │  · backups/ 目录存放定时备份                 │
    └────────────────────────────────────────────┘

    Caddy 与应用通过内部网络互联；应用本身也直接提供静态资源与 /api/* 接口，
    对外仅暴露 Caddy 的 80/443 端口。

## 2. 部署路径

### 路径 ①：Docker Compose + Caddy（适合海外 / 无需备案）

适用场景：服务器在境外，或主要面向海外访客，无需 ICP 备案即可由 Caddy 自动签发
Let's Encrypt 证书。

步骤：

1) 准备环境变量（在 data-trace/ 目录下）：

    cp .env.example .env
    # 编辑 .env：设置 DOMAIN 以及 PUBLIC_BASE_URL、MANAGE_LINK_SECRET、
    # DISPATCH_API_KEY、MAIL_LOG_API_KEY 等（DOMAIN 为必填）。

2) 构建并启动：

    cd data-trace
    docker compose up -d --build

3) 验证健康检查与域名访问：

    docker compose ps
    curl -s http://127.0.0.1:3000/api/health   # 宿主机直连应用（可选）
    curl -s https://<你的域名>/api/health       # 经 Caddy 访问

说明：
- app 服务通过 env_file 注入 .env 中的变量；若尚未创建 .env，需删除
  docker-compose.yml 中 env_file 两行，否则会报「找不到文件」。
- Caddy 的 DOMAIN 来自 .env 中的 DOMAIN 变量（compose 层强制必填），并注入到
  Caddyfile 的占位符中。
- 应用数据保存在命名卷 app-data 中，重启 / 重建容器不丢数据。

### 路径 ②：裸机 systemd + Caddy（适合国内已备案服务器）

适用场景：服务器在境内、面向大陆访客；域名已完成 ICP 备案（并按当地要求完成
公安备案），证书可由 Caddy 自动签发或使用云厂商证书。

1) 创建运行用户与目录：

    sudo useradd --system --home /opt/datatrace --shell /usr/sbin/nologin datatrace
    sudo mkdir -p /opt/datatrace
    sudo rsync -a --exclude data --exclude node_modules data-trace/ /opt/datatrace/
    # 或 git clone 到 /opt/datatrace；代码只需 datatrace 用户可读即可

2) 准备环境变量：

    sudo cp data-trace/deploy/systemd/datatrace.env.example /etc/datatrace.env
    sudo chmod 600 /etc/datatrace.env
    # 编辑 /etc/datatrace.env，填写真实值

3) 数据目录二选一（应用已支持 DATABASE_PATH 环境变量）：

    # 方式 A（推荐）：在 /etc/datatrace.env 中直接指定
    #   DATABASE_PATH=/var/lib/datatrace/data-trace.sqlite
    # 方式 B：建立符号链接，使默认 data 目录与服务 ReadWritePaths 一致
    sudo mkdir -p /var/lib/datatrace
    sudo chown datatrace:datatrace /var/lib/datatrace
    sudo rmdir /opt/datatrace/data 2>/dev/null || true
    sudo ln -s /var/lib/datatrace /opt/datatrace/data

4) 安装 systemd 服务：

    sudo cp data-trace/deploy/systemd/datatrace.service /etc/systemd/system/datatrace.service
    sudo systemctl daemon-reload
    sudo systemctl enable --now datatrace

5) 校验与查看日志：

    systemctl status datatrace
    curl -s http://127.0.0.1:3000/api/health
    journalctl -u datatrace -f

6) 配置 Caddy（可复用 data-trace/Caddyfile 的站点块，把 app:3000 改为 127.0.0.1:3000，
   并把占位符换成真实域名）。Caddy 本身可用官方二进制或包管理器安装后以 systemd 运行。

## 3. 环境变量表

下表与当前 .env.example 保持一致，并标注了规划中的新增邮件变量。

| 变量 | 必需 | 说明 |
|------|------|------|
| PORT | 否 | 监听端口，默认 3000 |
| PUBLIC_BASE_URL | 是 | 对外公开的 HTTPS 域名，用于生成订阅 / 退订链接 |
| MANAGE_LINK_SECRET | 是 | 订阅管理链接签名密钥（HMAC），请用长随机串 |
| DISPATCH_API_KEY | 是 | 每日简报调度接口的鉴权头 x-dispatch-key |
| MAIL_LOG_API_KEY | 是 | 邮件日志回写接口的鉴权头 x-mail-log-key |
| MAIL_API_URL | 规划 | 发信服务地址（邮件变量由发信模块实现，以 .env.example 最终版为准） |
| MAIL_API_KEY | 规划 | 发信服务密钥 |
| MAIL_FROM | 规划 | 发件地址 |
| MAIL_FROM_NAME | 规划 | 发件人名称 |
| CONFIRMATION_DRY_RUN | 规划 | 订阅确认是否干跑（不真实发信） |
| MAX_SEND_ATTEMPTS | 规划 | 单封邮件最大发送次数 |
| TRUST_PROXY | 规划 | 是否信任反向代理头（裸机 Caddy 部署时启用） |

DOMAIN 为 Docker Compose 编排层专用变量（必填），用于 Caddy 站点地址占位，
不进入应用容器。

## 4. 备份与恢复

备份（backup.sh，依赖 Node >= 22.5 内置 node:sqlite，无需 sqlite3 CLI）：

    # Docker 部署：数据在命名卷里，可在容器内执行
    docker compose exec app node /app/deploy/backup.sh   # 若已把 deploy 复制进镜像
    # 更简单的方式：从宿主机指向卷所在目录执行
    DATA_DIR=/var/lib/docker/volumes/data-trace_app-data/_data ./deploy/backup.sh

    # 裸机部署
    DATA_DIR=/var/lib/datatrace /opt/datatrace/deploy/backup.sh

脚本用 VACUUM INTO 生成一致性快照（WAL 模式下可在线执行，不阻塞写入），
备份写入数据目录下的 backups/，默认保留最近 14 份（可用 KEEP= 覆盖）。

定时备份（crontab 示例，每天 02:00）：

    0 2 * * *  DATA_DIR=/var/lib/datatrace /opt/datatrace/deploy/backup.sh >> /var/log/datatrace-backup.log 2>&1

恢复：

    # 1) 停止服务
    sudo systemctl stop datatrace        # 裸机
    docker compose stop app              # Docker

    # 2) 用某份备份覆盖主库（先保留一份现场副本）
    sudo cp /var/lib/datatrace/backups/data-trace-<时间戳>.sqlite /var/lib/datatrace/data-trace.sqlite

    # 3) 启动服务
    sudo systemctl start datatrace
    docker compose start app

可选：备份后上传 OSS/S3（示例见 backup.sh 文件头注释）。

## 5. 每日调度

应用要求 scheduledAt 为北京时间 08:00（即 UTC 当天 00:00），接口幂等。

方式 A：服务器 crontab（使用 daily-dispatch.sh）

    # crontab -e 添加（服务器本地时区为 Asia/Shanghai 时）
    0 8 * * *  DISPATCH_URL=https://<你的域名> DISPATCH_API_KEY=<密钥> /opt/datatrace/deploy/daily-dispatch.sh >> /var/log/datatrace-dispatch.log 2>&1

方式 B：GitHub Actions（.github/workflows/daily-dispatch.yml）

    - 定时触发：cron '0 0 * * *'（UTC 00:00 = 北京时间 08:00）
    - 手动触发：workflow_dispatch
    - 在仓库 Settings → Secrets and variables → Actions 中配置两个 Secret：
      DISPATCH_URL（如 https://<你的域名>）与 DISPATCH_API_KEY
    - concurrency: daily-dispatch 防止定时与手动触发重叠导致重复运行

两种方式逻辑一致：计算当天 UTC 00:00 的 ISO 时间戳，POST 到
/api/dispatch/messages；非 2xx 且非 alreadyPrepared 幂等响应时退出码非 0。

## 6. 上线 Checklist

- [ ] 域名解析生效，且面向大陆访客时已完成 ICP 备案与公安备案（否则 Caddy 443
      可能被阻断或无法合规运营）。
- [ ] 双重确认订阅流程已启用并验证，才允许开启真实发信（避免向未确认邮箱误发）。
- [ ] MANAGE_LINK_SECRET / DISPATCH_API_KEY / MAIL_LOG_API_KEY 均已替换为强随机值。
- [ ] 健康检查通过：curl -s https://<域名>/api/health 返回 status: ok。
- [ ] 安全头双层生效：Caddy 下发 X-Content-Type-Options / X-Frame-Options /
      Referrer-Policy 并移除 Server 头，应用层也设置 cache-control 等。
- [ ] 备份已配置并成功跑通一次（含恢复演练）。
- [ ] 每日调度已配置（服务器 crontab 或 GitHub Actions），并验证一次幂等行为。
- [ ] TLS 证书可自动续期（Caddy 的 /data、/config 已持久化）。
- [ ] 日志可观测：systemd journalctl 或 docker compose logs 能查看到请求日志。

## 7. FAQ

Q1：为什么要求 Node >= 22.5？
A1：项目零第三方依赖，直接使用 Node 内置的 node:sqlite；该模块自 Node 22.5.0 起
    稳定可用。Dockerfile 使用 node:22-slim，CI 使用 node-version: 22，均满足要求。

Q2：镜像健康检查为什么用 node -e 而不是 curl？
A2：node:22-slim 镜像内没有 curl，用 Node 内置 fetch 探测 /api/health 即可，不额外装包。

Q3：备份为什么用 VACUUM INTO 而不是直接 cp 文件？
A3：VACUUM INTO 生成一致性的在线快照（WAL 模式下不会拷贝到半写状态），
    同时还能整理碎片；sqlite3 CLI 未必安装，故用 node -e 内联脚本完成。

Q4：daily-dispatch 重复触发会怎样？
A4：接口按「日期 + 北京时间 08:00」幂等，重复触发返回 alreadyPrepared: true；
    脚本与 GitHub Actions 均将其视为成功，不会重复生成邮件。

Q5：docker compose 启动报「请在 .env 中设置 DOMAIN」？
A5：在 data-trace/.env 中填写 DOMAIN 后再启动；DOMAIN 是 Caddy 站点地址，必填。

Q6：裸机部署数据写不进 /opt/datatrace/data？
A6：应用已支持 DATABASE_PATH 环境变量，可在 /etc/datatrace.env 直接指定
    DATABASE_PATH=/var/lib/datatrace/data-trace.sqlite；或按第 2.2 节第 3 步把 data 目录
    符号链接到 /var/lib/datatrace。两种方式都需保证 /var/lib/datatrace 属主为 datatrace，
    与 systemd 服务的 ReadWritePaths 一致。
