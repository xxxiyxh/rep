import { Sun, Moon, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Topbar() {
  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark"),
  );
  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <header className="h-12 flex items-center justify-between px-4 shadow-sm bg-[var(--bg)]">
      <h1 className="text-lg font-semibold flex items-center gap-2">
        <span className="text-primary">gollm-mini</span>
        <span className="text-sm opacity-60">Playground</span>
      </h1>

      <div className="flex gap-2">
        <Button size="icon" variant="ghost" onClick={toggle}>
          {dark ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
        </Button>
        <Button size="icon" variant="ghost" asChild>
          <a
            href="https://github.com/xxxiyxh/gollm-ui"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="h-5 w-5"/>
          </a>
        </Button>
      </div>
    </header>
  );
}
