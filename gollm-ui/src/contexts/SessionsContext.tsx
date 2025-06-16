import {
  createContext, useContext, useState, useEffect, type ReactNode,
} from "react";
import { type Session } from "../types";
import { clearSessionOnServer } from "../api";

interface Ctx {
  sessions: Session[];
  currentId: string;
  setCurrentId: (id: string) => void;
  createSession: () => void;
  deleteSession: (id: string) => void;   // ★ 别忘了加上这行
  pushUserMsg: (text: string) => void;
  appendDelta: (delta: string) => void;
  finishAssistant: () => void;
  clearCurrent: () => Promise<void>;
}

const SessionsContext = createContext({} as Ctx);
export const useSessions = () => useContext(SessionsContext);

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>(() =>
    JSON.parse(localStorage.getItem("sessions") || "[]"),
  );
  const [currentId, setCurrentId] = useState(() =>
    localStorage.getItem("currentId") || "",
  );

  // persist
  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);
  useEffect(() => {
    localStorage.setItem("currentId", currentId);
  }, [currentId]);

  // helpers
  function createSession() :string{
    const id = crypto.randomUUID();
    setSessions(s => [...s, { id, title: "New Chat", messages: [] }]);
    setCurrentId(id);
    return id;
  }

  function deleteSession(id: string) {
    setSessions(prev => {
      const remain = prev.filter(s => s.id !== id);
      // 自动切换到最新（或新建）
      if (remain.length === 0) {
        const newId = crypto.randomUUID();
        setCurrentId(newId);
        return [{ id: newId, title: "New Chat", messages: [] }];
      }
      if (id === currentId) {
        setCurrentId(remain[0].id);
      }
      return remain;
    });
    clearSessionOnServer(id);
  }

  function mut(mod: (s: Session) => Session) {
    setSessions(all => all.map(s => (s.id === currentId ? mod(s) : s)));
  }

  function pushUserMsg(text: string) {
    mut(s => ({
      ...s,
      title: s.title === "New Chat" ? text.slice(0, 20) : s.title,
      messages: [...s.messages, { role: "user", content: text }, { role: "assistant", content: "" }],
    }));
  }

  function appendDelta(delta: string) {
    mut(s => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      const needsSpace =
        last.content && !/\s$/.test(last.content) && !/^[\s.,!?;:]/.test(delta);
      msgs[msgs.length - 1] = {
        ...last,
        content: last.content + (needsSpace ? " " : "") + delta,
      };
      return { ...s, messages: msgs };
    });
  }

  function finishAssistant() {
    // 可加 loading 结束处理
  }

  async function clearCurrent() {
    await clearSessionOnServer(currentId);
    mut(s => ({ ...s, messages: [] }));
  }

  return (
    <SessionsContext.Provider
      value={{
        sessions,
        currentId,
        setCurrentId,
        createSession,
        deleteSession,   // ★ 别漏了这行
        pushUserMsg,
        appendDelta,
        finishAssistant,
        clearCurrent,
      }}
    >
      {children}
    </SessionsContext.Provider>
  );
}
