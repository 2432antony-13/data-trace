# DataTrace 应用镜像
# 零第三方运行时依赖：Node 22+ 内置 node:sqlite，因此无需 npm install。
# 构建（构建上下文为 data-trace/ 目录）：
#   docker build -t datatrace .
FROM node:22-slim

# 生产环境标志与默认端口
ENV NODE_ENV=production     PORT=3000

WORKDIR /app

# 仅复制运行所需的清单与源码/静态资源（零依赖，无需 npm ci）
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node src/ ./src/
COPY --chown=node:node public/ ./public/

# 数据目录：应用默认把 SQLite 写到 /app/data/data-trace.sqlite。
# 先创建目录并归属给非 root 的 node 用户，再声明为卷，确保命名卷首次挂载时 node 可写。
RUN mkdir -p /app/data && chown -R node:node /app/data
VOLUME /app/data

EXPOSE 3000

# 健康检查：镜像内无 curl，用 node 内置 fetch 探测 /api/health。
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3   CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r=>r.ok?r.json():Promise.reject(new Error('health check failed'))).then(j=>{if(j.status!=='ok')process.exit(1)}).catch(()=>process.exit(1))"]

# 以非 root 用户 node 运行
USER node

CMD ["node", "src/server.mjs"]
