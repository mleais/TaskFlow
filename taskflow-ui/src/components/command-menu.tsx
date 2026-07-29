import { useState, useEffect, useRef } from "react";
import { Search, Zap, Kanban, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface CommandMenuProps {
  open: boolean;
  onClose: () => void;
  onCreateIssue?: () => void;
}

const commands = [
  { id: "kanban", label: "Kanban Görünümü", icon: Kanban, description: "Panoya git" },
  { id: "new-issue", label: "Yeni İş Oluştur", icon: Plus, description: "Hızlı iş oluştur" },
  { id: "logout", label: "Çıkış Yap", icon: LogOut, description: "Oturumu kapat" },
];

export function CommandMenu({ open, onClose, onCreateIssue }: CommandMenuProps) {
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
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-28 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Komut ara..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">ESC</kbd>
        </div>

        <div className="py-2 max-h-72 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">Sonuç bulunamadı</div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => executeCommand(cmd.id)}
              onMouseEnter={() => setSelected(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                i === selected ? "bg-violet-500/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <cmd.icon className={`w-4 h-4 shrink-0 ${i === selected ? "text-violet-400" : ""}`} />
              <div className="flex-1">
                <span className="text-sm font-medium">{cmd.label}</span>
                <span className="text-xs text-muted-foreground ml-2">{cmd.description}</span>
              </div>
              {i === selected && (
                <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">↵</kbd>
              )}
            </button>
          ))}
        </div>

        <div className="border-t border-border/50 px-4 py-2 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-violet-400" />
            <span className="text-xs text-muted-foreground">TaskFlow CMD+K</span>
          </div>
          <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
            <span><kbd className="bg-muted px-1 rounded font-mono">↑↓</kbd> Gezin</span>
            <span><kbd className="bg-muted px-1 rounded font-mono">↵</kbd> Seç</span>
          </div>
        </div>
      </div>
    </div>
  );
}
