import { useEffect, useState } from "react";
import {
  listTemplates,
  getTemplate,
  deleteTemplate,
  saveTemplate,
} from "../api";
import TemplateEditor from "./TemplateEditor";
import type { Template } from "../types";

import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";


export default function TemplateList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Template | null>(null);
  const [search, setSearch] = useState("");
  const [openEditor, setOpenEditor] = useState(false);

  async function refresh() {
    setTemplates(await listTemplates());
  }
  useEffect(() => {
    refresh();
  }, []);

  async function handleEdit(name: string, version: number) {
    setEditing(await getTemplate(name, version));
    setOpenEditor(true);
  }

  async function handleDelete(name: string, version: number) {
    await deleteTemplate(name, version);
    toast.success("Template deleted");
    refresh();
  }

  async function handleSave(data: Template) {
    await saveTemplate(data);
    toast.success("Template saved");
    setOpenEditor(false);
    refresh();
  }

  const groups = templates.reduce<Record<string, Template[]>>((acc, cur) => {
    (acc[cur.name] ||= []).push(cur);
    return acc;
  }, {});
  const filtered = Object.entries(groups).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      {/* 工具栏 */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search template…"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => {
            setEditing(null);
            setOpenEditor(true);
          }}
          className="px-4 py-2 bg-primary text-black rounded-md shadow hover:shadow-lg cursor-pointer transition"
        >
          ＋ New Template
        </motion.button>

      </div>

      {/* 卡片列表 */}
      <div
        className="grid gap-4 w-full"
        style={{
          gridTemplateColumns:
            templates.length <= 6
              ? `repeat(${templates.length}, minmax(12rem, 1fr))`
              : `repeat(auto-fit, minmax(12rem, 1fr))`,
        }}
      >

        {filtered.map(([name, vers]) => (
          <Card key={name} className="shadow-md relative">
            {/* 卡片头部 */}
            <CardHeader className="relative pb-2">
              <h3 className="font-semibold text-lg pr-16 truncate">{name}</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute top-2 right-2 text-sm border border-gray-300 px-2 py-1 rounded-md bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 cursor-pointer transition"
                onClick={() => handleEdit(name, vers.at(-1)!.version)}
              >
                Edit
              </motion.button>

            </CardHeader>

            {/* 卡片内容 */}
            <CardContent className="text-sm space-y-2">
              <div>Latest v{vers.at(-1)!.version}</div>
              <Accordion type="single" collapsible>
                <AccordionItem value="versions">
                  <AccordionTrigger className="text-xs cursor-pointer transition">Versions</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-sm">
                      {vers
                        .sort((a, b) => b.version - a.version)
                        .map((v) => (
                          <li key={v.version} className="flex justify-between">
                            <span>v{v.version}</span>
                            <div className="space-x-1">
                              <Button
                                size="sm"
                                variant="link"
                                className="text-xs px-1 cursor-pointer transition"
                                onClick={() => handleEdit(name, v.version)}
                              >
                                edit
                              </Button>
                              <Button
                                size="sm"
                                variant="link"
                                className="text-xs px-1 text-red-600 cursor-pointer transition"
                                onClick={() => handleDelete(name, v.version)}
                              >
                                del
                              </Button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 弹出编辑器 */}
      <Dialog open={openEditor} onOpenChange={setOpenEditor}>
        <DialogContent className="max-w-3xl bg-white dark:bg-neutral-900 shadow-2xl border border-border">
          <DialogHeader>
            {editing
              ? `Edit ${editing.name} v${editing.version}`
              : "New Template"}
          </DialogHeader>
          <TemplateEditor
            value={editing || undefined}
            onSave={handleSave}
            onCancel={() => setOpenEditor(false)}
          />
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </div>
  );
}
