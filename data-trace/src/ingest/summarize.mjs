// 可选 LLM 摘要模块。
// 仅当 env 同时配置 SUMMARIZE_API_URL 与 SUMMARIZE_API_KEY 时才发起请求；
// 任何失败（未配置 / 网络 / 非 2xx / 超时 / 响应格式不符）一律返回 null，永不 throw。
export async function summarize({ title, text, env = process.env }) {
  const url = env.SUMMARIZE_API_URL;
  const key = env.SUMMARIZE_API_KEY;
  if (!url || !key) return null;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(45000)
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && typeof data === 'object' && ('summaryEn' in data || 'summaryZh' in data)) {
      return {
        summaryEn: data.summaryEn ?? null,
        summaryZh: data.summaryZh ?? null
      };
    }
    return null;
  } catch {
    return null;
  }
}
