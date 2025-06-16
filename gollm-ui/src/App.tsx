// src/App.tsx
import { useEffect, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import TemplateList from "./components/TemplateList";
import OptimizerPanel from "./components/OptimizerPanel";

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash || "#chat");
  useEffect(() => {
    const fn = () => setHash(window.location.hash || "#chat");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();               // ← 动态监听

  let page: React.ReactNode;
  if (hash.startsWith("#template")) page = <TemplateList />;
  else if (hash.startsWith("#optimizer")) page = <OptimizerPanel />;
  else page = <ChatPanel />;            // #chat / 其它兜底

  return (
    <div className="h-screen flex flex-col">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />   {/* 传给侧边栏做高亮 */}
        {page}
      </div>
    </div>
  );
}
