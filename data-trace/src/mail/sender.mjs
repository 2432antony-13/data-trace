// src/mail/sender.mjs
// 零第三方依赖的发信适配层，支持两种通道：
//   ① HTTP 网关（默认）：Resend / Postmark 风格（POST JSON + Bearer token），
//      可替换为 SES / 阿里云 DirectMail 等 HTTP 服务；
//   ② SMTP（MAIL_TRANSPORT=smtp）：内置极简 SMTP 客户端（net + tls，
//      支持 STARTTLS + AUTH LOGIN），适配 Gmail（smtp.gmail.com:587）等。
// 调用方无需感知通道差异：sendEmail(env, {...}) 永不 throw，统一返回 { ok, result }。

import { connect } from 'node:net';
import { connect as connectTls } from 'node:tls';

const SEND_TIMEOUT_MS = 30_000;

/**
 * 邮件是否已配置。
 * HTTP 通道：MAIL_API_URL + MAIL_API_KEY；SMTP 通道：MAIL_SMTP_HOST + MAIL_SMTP_USER + MAIL_SMTP_PASS。
 * @param {Record<string, string | undefined>} env
 */
export function isMailConfigured(env) {
  if (env.MAIL_TRANSPORT === 'smtp') {
    return Boolean(env.MAIL_SMTP_HOST && env.MAIL_SMTP_USER && env.MAIL_SMTP_PASS && env.MAIL_FROM);
  }
  return Boolean(env.MAIL_API_URL && env.MAIL_API_KEY);
}

/** 从 "Name <addr>" 形式的发件人串中提取纯地址；否则原样返回。 */
function extractMailAddress(from) {
  const value = String(from || '');
  const match = value.match(/<([^>]+)>/);
  return match ? match[1].trim() : value.trim();
}

/**
 * 通过 HTTP 发送一封邮件。
 * 永不 throw：网络/HTTP 错误返回 { ok:false, result:{ message } }，
 * 成功返回 { ok:true, result }（result 为响应 JSON，或 { status }）。
 * @param {Record<string, string | undefined>} env
 * @param {{ to: string, subject: string, text?: string, html?: string, headers?: Record<string, string> }} options
 */
export async function sendEmail(env, options) {
  if (env.MAIL_TRANSPORT === 'smtp') return smtpSendEmail(env, options);
  return httpSendEmail(env, options);
}

async function httpSendEmail(env, { to, subject, text, html, headers = {} }) {
  const from = env.MAIL_FROM || '';
  // 构建出站 headers，并自动附加一键退订相关头（RFC 2369 / RFC 8058）。
  const outboundHeaders = { ...headers };
  const unsubscribeUrl = outboundHeaders.unsubscribeUrl;
  delete outboundHeaders.unsubscribeUrl;
  if (unsubscribeUrl) {
    const mailFrom = extractMailAddress(from);
    outboundHeaders['List-Unsubscribe'] = mailFrom
      ? `<${unsubscribeUrl}>, <mailto:${mailFrom}>`
      : `<${unsubscribeUrl}>`;
    outboundHeaders['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const response = await fetch(env.MAIL_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${env.MAIL_API_KEY}`
      },
      body: JSON.stringify({ from, to, subject, text, html, headers: outboundHeaders }),
      signal: controller.signal
    });
    const raw = await response.text();
    let result;
    try {
      result = raw ? JSON.parse(raw) : { status: response.status };
    } catch {
      result = { status: response.status };
    }
    if (!response.ok) {
      return {
        ok: false,
        result: { message: (result && result.message) || `Email provider responded with HTTP ${response.status}.` }
      };
    }
    return { ok: true, result };
  } catch (error) {
    return { ok: false, result: { message: error?.message || 'Email send failed.' } };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------- SMTP 通道（零依赖客户端：net + tls，STARTTLS + AUTH LOGIN） ----------------

/** RFC 2047 编码主题（非 ASCII 时 base64），Gmail 等对裸 UTF-8 主题兼容性不稳定。 */
function encodeSubject(subject) {
  const value = String(subject || '');
  return /^[\x20-\x7e]*$/.test(value)
    ? value
    : `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

/** SMTP 行协议数据中点号转义（正文以 . 开头的行前加一个 .；兼容 \r\n 与裸 \n 换行）。 */
function dotStuff(text) {
  return String(text || '').split(/\r?\n/).map((line) => (line.startsWith('.') ? '.' + line : line)).join('\r\n');
}

/** 构建 RFC 5322 消息（multipart/alternative 或纯文本），含退订头。 */
function buildSmtpMessage({ from, to, subject, text, html, headers }) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    'Date: ' + new Date().toUTCString(),
    'MIME-Version: 1.0'
  ];
  for (const [key, value] of Object.entries(headers || {})) {
    if (key === 'unsubscribeUrl') continue;
    lines.push(`${key}: ${value}`);
  }
  const unsubscribeUrl = headers?.unsubscribeUrl;
  if (unsubscribeUrl) {
    lines.push(`List-Unsubscribe: <${unsubscribeUrl}>, <mailto:${extractMailAddress(from)}>`);
    lines.push('List-Unsubscribe-Post: List-Unsubscribe=One-Click');
  }
  if (html) {
    const boundary = '=_dt_' + Date.now().toString(36);
    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`, '', '--' + boundary);
    lines.push('Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: 8bit', '', dotStuff(text || ''));
    lines.push('--' + boundary, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: 8bit', '', dotStuff(html));
    lines.push('--' + boundary + '--');
  } else {
    lines.push('Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: 8bit', '', dotStuff(text || ''));
  }
  return lines.join('\r\n') + '\r\n';
}

/**
 * 极简 SMTP 交换：greeting → EHLO → [STARTTLS → EHLO] → AUTH LOGIN → MAIL FROM → RCPT TO → DATA → QUIT。
 * 返回 { ok, result }，永不 throw。日志只记录方向与响应码，绝不记录凭据。
 */
function smtpExchange({ host, port, secure, user, pass, from, to, message, onLog }) {
  return new Promise((resolve) => {
    let socket;
    try {
      socket = connect({ host, port });
    } catch (error) {
      resolve({ ok: false, result: { message: error?.message || 'SMTP connect failed.' } });
      return;
    }
    const log = (entry) => onLog && onLog(entry);
    let buffer = '';
    let stage = 'greeting';
    let settled = false;
    let capabilities = [];
    const timeout = setTimeout(() => finish(false, 'SMTP timeout after ' + SEND_TIMEOUT_MS + 'ms.'), SEND_TIMEOUT_MS);

    function finish(ok, detail) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try { socket.destroy(); } catch { /* noop */ }
      resolve(ok ? { ok: true, result: { status: 250, message: detail } } : { ok: false, result: { message: detail } });
    }
    function send(line) {
      log('C: ' + (line.length > 160 ? line.slice(0, 160) + '…' : line));
      try { socket.write(line + '\r\n'); } catch (error) { finish(false, error?.message); }
    }
    function handleLine(line) {
      log('S: ' + line);
      const code = Number(line.slice(0, 3)) || 0;
      if (line[3] === '-') { capabilities.push(line.slice(4)); return; } // 多行应答中间行
      const text = line.slice(4);
      if (code >= 400) return finish(false, `SMTP ${code}: ${text}`);
      switch (stage) {
        case 'greeting':
          if (code !== 220) return finish(false, 'Unexpected SMTP greeting.');
          stage = 'ehlo1';
          return send('EHLO datatrace.local');
        case 'ehlo1':
          if (secure !== false && capabilities.some((cap) => cap.toUpperCase().startsWith('STARTTLS'))) {
            capabilities = [];
            stage = 'starttls';
            return send('STARTTLS');
          }
          return beginAuth();
        case 'starttls': {
          if (code !== 220) return finish(false, 'SMTP server refused STARTTLS.');
          capabilities = [];
          const rawSocket = socket;
          rawSocket.removeAllListeners('data');
          rawSocket.removeAllListeners('error');
          const tlsSocket = connectTls({ socket: rawSocket, servername: host });
          socket = tlsSocket;
          tlsSocket.on('data', onData);
          tlsSocket.on('error', (error) => finish(false, error?.message || 'TLS upgrade failed.'));
          stage = 'ehlo2';
          return send('EHLO datatrace.local');
        }
        case 'ehlo2':
          return beginAuth();
        case 'authUser':
          // AUTH LOGIN 第一次 334：提示用户名
          if (code !== 334) return finish(false, 'SMTP server rejected AUTH LOGIN.');
          stage = 'authPass';
          return send(Buffer.from(user, 'utf8').toString('base64'));
        case 'authPass':
          // AUTH LOGIN 第二次 334：提示密码
          if (code !== 334) return finish(false, 'SMTP authentication failed — 请检查 Gmail 应用专用密码。');
          stage = 'mailFrom';
          return send(Buffer.from(pass, 'utf8').toString('base64'));
        case 'mailFrom':
          // 认证成功（235）后发送信封发件人
          if (code !== 235) return finish(false, 'SMTP authentication failed — 请检查 Gmail 应用专用密码。');
          stage = 'rcptTo';
          return send(`MAIL FROM:<${extractMailAddress(from)}>`);
        case 'rcptTo':
          // MAIL FROM 被接受（250）→ 发送收件人
          if (code !== 250) return finish(false, `SMTP rejected sender: ${text}`);
          stage = 'data';
          return send(`RCPT TO:<${extractMailAddress(to)}>`);
        case 'data':
          // RCPT TO 被接受（250）→ 请求 DATA
          if (code !== 250) return finish(false, `SMTP rejected recipient: ${text}`);
          stage = 'dot';
          return send('DATA');
        case 'dot':
          // 354 → 发送完整消息（以 . 结束）
          if (code !== 354) return finish(false, 'SMTP refused DATA.');
          stage = 'dotWait';
          return send(message + '.');
        case 'dotWait':
          // 消息被接受（250）→ QUIT
          if (code !== 250) return finish(false, `SMTP rejected message: ${text}`);
          stage = 'quit';
          return send('QUIT');
        case 'quit':
          return finish(true, 'SMTP message accepted: ' + text);
        default:
          return finish(false, 'SMTP state machine error.');
      }
    }
    function beginAuth() {
      stage = 'authUser';
      return send('AUTH LOGIN');
    }
    function onData(chunk) {
      buffer += chunk.toString('utf8');
      let index;
      while ((index = buffer.indexOf('\r\n')) !== -1 && !settled) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        handleLine(line);
      }
    }
    socket.on('data', onData);
    socket.on('error', (error) => finish(false, error?.message || 'SMTP connection error.'));
  });
}

/** SMTP 通道发信（Gmail 等）。MAIL_SMTP_PORT 默认 587，MAIL_SMTP_SECURE=0 可关 STARTTLS（仅测试）。 */
async function smtpSendEmail(env, { to, subject, text, html, headers = {} }) {
  const from = env.MAIL_FROM || '';
  const host = env.MAIL_SMTP_HOST;
  const port = Number(env.MAIL_SMTP_PORT) || 587;
  const secure = env.MAIL_SMTP_SECURE !== '0';
  const user = env.MAIL_SMTP_USER;
  const pass = env.MAIL_SMTP_PASS;
  const outboundHeaders = { ...headers };
  const unsubscribeUrl = outboundHeaders.unsubscribeUrl;
  delete outboundHeaders.unsubscribeUrl;
  const message = buildSmtpMessage({ from, to, subject, text, html, headers: { ...outboundHeaders, unsubscribeUrl } });
  return smtpExchange({ host, port, secure, user, pass, from, to, message, onLog: (line) => console.log('[smtp] ' + line) });
}
