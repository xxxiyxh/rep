import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import type { Template } from "../types";
import { motion } from "framer-motion";


interface TemplateEditorProps {
  value?: Template;
  onSave: (data: Template) => void;
  onCancel: () => void;
}

export default function TemplateEditor({ value, onSave }: TemplateEditorProps) {
  const [data, setData] = useState<Template>({
    name: value?.name || "",
    version: value?.version || 1,
    prompt: value?.prompt || "",
    system: value?.system || "",
    createdAt : value?.createdAt || "",
  });

  return (
    <div className="space-y-3">
      
        
        <div className="space-y-2">
          <input className="border p-1 w-1/2"
            placeholder="名称"
            value={data.name}
            onChange={e => setData(d => ({ ...d, name: e.target.value }))}
          />
          <input className="border p-1 w-1/2"
            placeholder="版本"
            value={data.version}
            onChange={e => setData(d => ({ ...d, version: Number(e.target.value) }))}
          />
        </div>
        <div>
          <div className="mb-1">Prompt</div>
          <MonacoEditor
            height="60px"
            language="markdown"
            value={data.prompt}
            options={{
              lineNumbers:"off",
              minimap:{ enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 4, bottom: 4 },
              fontSize: 14,
            }}
            onChange={(v: string | undefined) => setData(d => ({ ...d, system: v || "" }))}
          />
        </div>
        <div>
          <div className="mb-1">System</div>
          <MonacoEditor
            height="60px"
            language="markdown"
            value={data.system}
            options={{
              lineNumbers:"off",
              minimap:{ enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 4, bottom: 4 },
              fontSize: 14,
            }}
            onChange={(v: string | undefined) => setData(d => ({ ...d, system: v || "" }))}
          />
        </div>
        <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-blue-600 text-white px-4 py-1 rounded shadow hover:bg-blue-700 cursor-pointer transition"
            onClick={() => onSave(data)}
          >
            保存
        </motion.button>
      
    </div>
  );
}
