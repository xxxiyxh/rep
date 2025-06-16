import { useEffect, useState } from "react";
import { useSessions } from "../contexts/SessionsContext";
import clsx from "clsx";
import {
  MessageSquare,
  FileText,
  BarChart3,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const {
    sessions,
    currentId,
    setCurrentId,
    createSession,
    deleteSession,
  } = useSessions();

  /* --- 当前哈希 --- */
  const [hash, setHash] = useState(() => window.location.hash || "#chat");
  useEffect(() => {
    const fn = () => setHash(window.location.hash || "#chat");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);

  const inChat = hash.startsWith("#chat");
  const inTpl  = hash.startsWith("#template");
  const inOpt  = hash.startsWith("#optimizer");

  /* -------- 组件 JSX -------- */
  return (
    <aside className="w-64 border-r flex flex-col text-sm">
      {/* === Chats 顶栏 + New 按钮（同一行） === */}
      <div className="mx-3 mt-3 mb-2 flex items-center gap-2">
        <button
          onClick={() => (window.location.hash = "#chat")}
          className={clsx(
            "flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl",
            "transition-transform duration-150", 
            "hover:scale-[var(--hover-scale)]", 
            "hover:shadow-[var(--hover-shadow)]",
            "cursor-pointer transition duration-150",
            inChat
              ? "bg-primary/15 text-primary shadow-md"
              : "hover:bg-primary/10",
          )}
        >
          <MessageSquare className="h-4 w-4 opacity-60" />
          Chats
        </button>

        <button
          onClick={() => {
            const newId = createSession();
            window.location.hash = `#chat/${newId}`;
          }}
          className="
            p-2 rounded-full
            bg-black text-white
            dark:bg-white dark:text-black
            hover:brightness-90
            shadow-md
            disabled:opacity-50
            cursor-pointer transition duration-150
          "

          title="New chat"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* === 会话列表 === */}
      <h2 className="px-4 pb-1 text-xs font-bold uppercase text-gray-500">
        Sessions
      </h2>
      <ul className="flex-1 overflow-y-auto">
        {sessions.map((s) => {
          const active = inChat && s.id === currentId;
          return (
            <li
              key={s.id}
              className={clsx(
                "mx-2 my-1 flex items-center gap-2 px-3 py-2 rounded-2xl cursor-pointer transition",
                "cursor-pointer transition duration-150",
                "transition-transform duration-150", 
                "hover:scale-[var(--hover-scale)]", 
                "hover:shadow-[var(--hover-shadow)]",
                active
                  ? "bg-primary/15 text-primary shadow-md font-medium"
                  : "hover:bg-primary/10",
              )}
              onClick={() => {
                window.location.hash = `#chat/${s.id}`;
                setCurrentId(s.id);
              }}
              title={s.title}
            >
              <MessageSquare className="h-4 w-4 opacity-60" />
              <span className="flex-1 truncate">{s.title}</span>

              {/* 删除按钮 */}
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s.id);
                }}
                title="Delete"
                className="text-red-500 hover:text-red-700 cursor-pointer transition"
              >
                ✕
              </motion.button>
            </li>
          );
        })}
      </ul>

      {/* === Tools 分区 === */}
      <div className="border-t pt-2 pb-3 space-y-1">
        <button
          onClick={() => (window.location.hash = "#template")}
          className={clsx(
            "flex w-full items-center gap-2 px-4 py-2 rounded-2xl",
            "transition-transform duration-150", 
            "hover:scale-[var(--hover-scale)]", 
            "hover:shadow-[var(--hover-shadow)]",
            "cursor-pointer transition duration-150",
            inTpl
              ? "bg-primary/15 text-primary shadow-md"
              : "hover:bg-primary/10",
          )}
        >
          <FileText className="h-4 w-4 opacity-70" />
          Templates
        </button>

        <button
          onClick={() => (window.location.hash = "#optimizer")}
          className={clsx(
            "flex w-full items-center gap-2 px-4 py-2 rounded-2xl",
            "transition-transform duration-150", 
            "hover:scale-[var(--hover-scale)]", 
            "hover:shadow-[var(--hover-shadow)]",
            "cursor-pointer transition duration-150",
            inOpt
              ? "bg-primary/15 text-primary shadow-md"
              : "hover:bg-primary/10",
          )}
        >
          <BarChart3 className="h-4 w-4 opacity-70" />
          Optimizer
        </button>
      </div>
    </aside>
  );
}
