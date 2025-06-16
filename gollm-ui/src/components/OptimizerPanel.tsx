import { useEffect, useState } from "react";
import type { OptResult, Template, Variant } from "../types";
import { listTemplates, runOptimizer } from "../api";
import clsx from "clsx";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface Row extends Variant { id: string }

export default function OptimizerPanel() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [varsJson, setVarsJson] = useState('{"input":"", "lang":""}');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<OptResult | null>(null);
  const [error, setError] = useState("");
  const [activeAnswerKey, setActiveAnswerKey] = useState<string | null>(null);

  useEffect(() => { listTemplates().then(setTemplates); }, []);

  function addRow() {
    setRows(r => [...r, { id: crypto.randomUUID(), provider: "", model: "", tpl: "", version: 1 }]);
  }

  function updateRow(id: string, field: keyof Variant, val: string | number) {
    setRows(r => r.map(x => x.id === id ? { ...x, [field]: val } : x));
  }

  function delRow(id: string) { setRows(r => r.filter(x => x.id !== id)); }

  const [copied, setCopied] = useState(false);

  async function handleCopy() {
  if (!result || !activeAnswerKey) return;
  await navigator.clipboard.writeText(result.answers[activeAnswerKey] || "");
  setCopied(true);
  toast.success("回答已复制");
  setTimeout(() => setCopied(false), 2000);
  }


  async function run() {
    try {
      setRunning(true);
      setError("");
      setResult(null);
      const variants: Variant[] = rows.map(({ ...v }) => v);
      const vars = JSON.parse(varsJson);
      const res = await runOptimizer(variants, vars);
      setResult(res);
      setActiveAnswerKey(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(String(msg));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <h2 className="text-xl font-semibold">Optimizer 对比</h2>

      {/* 设置区 */}
      <div className="space-y-2">
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-100 text-left uppercase text-xs text-gray-500">
              <tr>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Model</th>
                <th className="px-3 py-2">Template</th>
                <th className="px-3 py-2">Ver</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-3 py-2">
                    <select value={r.provider}
                            onChange={e => updateRow(r.id,"provider",e.target.value)}
                            className="w-full border px-2 py-1 rounded-md bg-white dark:bg-black/10">
                      <option value="">—</option>
                      <option value="ollama">ollama</option>
                      <option value="openai">openai</option>
                      <option value="hf">huggingface</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input className="w-full border px-2 py-1 rounded-md"
                           value={r.model}
                           onChange={e => updateRow(r.id,"model",e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <select value={r.tpl}
                            onChange={e => updateRow(r.id,"tpl",e.target.value)}
                            className="w-full border px-2 py-1 rounded-md bg-white dark:bg-black/10">
                      <option value="">—</option>
                      {templates.map(t => (
                        <option key={t.name+ t.version}
                                value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" className="w-16 border px-2 py-1 rounded-md"
                           value={r.version}
                           onChange={e => updateRow(r.id,"version",Number(e.target.value))}/>
                  </td>
                  <td className="px-3 py-2 text-red-600">
                    <button onClick={() => delRow(r.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          className="mt-1 bg-primary text-black px-3 py-1 rounded-md shadow-sm hover:bg-primary/90 transition"
          onClick={addRow}
        >＋ 添加变体</button>

        <div className="mt-4 space-y-1">
          <label className="text-sm text-gray-500 font-medium">Vars (JSON)</label>
          <textarea className="w-full border px-3 py-2 font-mono text-sm rounded-md shadow-sm"
                    value={varsJson}
                    onChange={e => setVarsJson(e.target.value)} />
        </div>

        <button
          className="mt-3 bg-accent text-black px-4 py-2 rounded-lg hover:bg-accent/90 transition shadow disabled:opacity-60"
          disabled={running || rows.length < 2}
          onClick={run}>
          {running ? "Running..." : "Run Compare"}
        </button>

        {error && <div className="text-red-600">{error}</div>}
      </div>

      {/* 结果展示区：左评分表格 + 右答案区 */}
      {result && (
        <div className="flex gap-6 mt-6 items-start">
          {/* 左侧评分表格 */}
          <div className="w-[420px] flex-shrink-0 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[200px]" />
                <col className="w-[60px]" />
                <col className="w-[80px]" />
                <col className="w-[60px]" />
              </colgroup>
              <thead className="bg-gray-100 text-left uppercase text-xs text-gray-500">
                <tr>
                  <th className="px-3 py-2">Variant</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Latency</th>
                  <th className="px-3 py-2">Answer</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.scores).map(([key, sc]) => {
                  const isBest = key === `${result.best.provider}|${result.best.model}|${result.best.tpl}:${result.best.version || 0}`;
                  return (
                    <tr key={key} className={clsx("hover:bg-gray-50 transition", isBest && "bg-yellow-50")}>
                      <td className="px-3 py-2 truncate">{key}</td>
                      <td className="px-3 py-2">{sc.toFixed(2)}</td>
                      <td className="px-3 py-2">{result.latencies[key]?.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => setActiveAnswerKey(key === activeAnswerKey ? null : key)}
                          className="text-accent hover:underline text-xs"
                        >
                          {key === activeAnswerKey ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 右侧答案显示区 */}
          <div className="flex-1 min-h-[240px] bg-yellow-50 rounded-xl shadow-inner p-4 overflow-auto max-h-[400px] whitespace-pre-wrap text-sm leading-relaxed relative">
            {activeAnswerKey ? (
              <>
                <div className="font-medium text-primary mb-2 flex justify-between items-center">
                  <span>{activeAnswerKey}</span>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-gray-500 hover:text-primary flex items-center gap-1 cursor-pointer transition"
                  >
                    {copied ? (
                      <span className="text-green-600 font-medium">✓ 已复制</span>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>

                </div>
                {result.answers[activeAnswerKey]}
              </>
            ) : (
              <div className="text-gray-400 italic">点击左侧 "View" 查看模型回复</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
