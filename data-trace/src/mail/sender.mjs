// src/mail/sender.mjs
// 零第三方依赖的 HTTP 发信适配层。
// 默认按 Resend / Postmark 风格调用（POST JSON + Bearer token）。
// 如需切换到 SES / 阿里云 DirectMail，只需替换本文件的 HTTP 细节，其余调用方无需改动。

const SEND_TIMEOUT_MS = 30_000;

/**
 * 邮件是否已配置。只有同时提供 MAIL_API_URL 与 MAIL_API_KEY 才算就绪。
 * @param {Record<string, string | undefined>} env
 */
export function isMailConfigured(env) {
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
export async function sendEmail(env, { to, subject, text, html, headers = {} }) {
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
