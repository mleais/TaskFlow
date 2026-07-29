import { useState, useEffect, useRef } from "react";
import { Search, Kanban, Plus, LogOut, List } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface CommandMenuProps {
  open: boolean;
  onClose: () => void;
  onCreateIssue?: () => void;
  onSetViewMode?: (mode: "board" | "list") => void;
}

const commands = [
  { id: "kanban", label: "Board View", icon: Kanban, description: "Switch to board layout" },
  { id: "list", label: "List View", icon: List, description: "Switch to list layout" },
  { id: "new-issue", label: "New Issue", icon: Plus, description: "Create a new issue" },
  { id: "logout", label: "Log out", icon: LogOut, description: "Sign out of your account" },
];

export function CommandMenu({ open, onClose, onCreateIssue, onSetViewMode }: CommandMenuProps) {
  const { logout } = useAuth();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); executeCommand(filtered[selected]?.id); }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected]);

  const executeCommand = (id?: string) => {
    if (!id) return;
    if (id === "logout") { logout(); }
    if (id === "new-issue") { onCreateIssue?.(); }
    if (id === "kanban") { onSetViewMode?.("board"); }
    if (id === "list") { onSetViewMode?.("list"); }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border/40">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-[15px] focus:outline-none text-foreground placeholder:text-muted-foreground/60"
          />
          <kbd className="text-[10px] bg-muted px-2 py-1 rounded text-muted-foreground font-mono">ESC</kbd>
        </div>

        <div className="py-2 max-h-[400px] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No results found.</div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => executeCommand(cmd.id)}
              onMouseEnter={() => setSelected(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                i === selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <cmd.icon className={`w-4 h-4 shrink-0 ${i === selected ? "text-primary-foreground" : "text-muted-foreground"}`} />
              <div className="flex-1 flex items-center gap-3">
                <span className={`text-[13px] font-medium ${i === selected ? "text-primary-foreground" : "text-foreground"}`}>{cmd.label}</span>
                <span className={`text-[12px] ${i === selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{cmd.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
