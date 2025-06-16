import type { ChatMessage, OptResult, Template, Variant } from "./types";

// --------- 非流式（保留，后面 Optimizer 会用到） ---------
export async function chat(text: string) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "ollama",
      model: "llama3",
      messages: [{ role: "user", content: text }]
    })
  });
  return res.json();
}

// --------- 流式，带 session_id ---------
export function chatStream(
  sessionId: string,
  messages: ChatMessage[],
  onDelta: (chunk: string) => void,
  onFinish: () => void
) {
  const ctrl = new AbortController();

  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: ctrl.signal,
    body: JSON.stringify({
      provider: "ollama",
      model: "llama3",
      stream: true,
      session_id: sessionId,
      messages
    })
  }).then(async res => {
    const reader = res.body!.getReader();
    const dec = new TextDecoder();

    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value);
      // SSE 分块：以 \n\n 分段
      const parts = buf.split("\n\n");
      buf = parts.pop()!;          // 最后一个可能是半截
      for (const p of parts) {
        if (p.startsWith("data:")) {
          const delta = p.slice(5);  // 冒号后的空格被浏览器吃掉
          onDelta(delta);
        }
      }
    }
  }).finally(onFinish);

  // 返回停止函数给前端
  return () => ctrl.abort();
}

export async function clearSessionOnServer(sessionId: string) {
  await fetch(`/api/memory/${sessionId}`, { method: "DELETE" });
}
// 模板相关接口

/* ---------------- Template ---------------- */

export async function listTemplates(): Promise<Template[]> {
  const res = await fetch("/api/template");
  return res.json();
}

export async function getTemplate(name: string, version?: number) {
  const url = version
    ? `/api/template/${name}/${version}`
    : `/api/template/${name}`;
  const res = await fetch(url, { method: "GET" });
  return res.json();
}

export async function saveTemplate(data: {
  name: string;
  version: number;
  prompt: string;
  system?: string;
  createdAt?: string;
}) {
  const res = await fetch("/api/template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteTemplate(name: string, version: number) {
  await fetch(`/api/template/${name}/${version}`, { method: "DELETE" });
}

/* ---------------- Optimizer ---------------- */

export async function runOptimizer(
  variants: Variant[],
  vars: Record<string, string>,
): Promise<OptResult> {
  const res = await fetch("/api/optimizer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variants, vars }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
