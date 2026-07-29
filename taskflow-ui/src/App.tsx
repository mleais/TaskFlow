import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { KanbanBoard } from "@/components/kanban-board";
import { LoginPage } from "@/components/login-page";
import { CommandMenu } from "@/components/command-menu";
import { Zap, LogOut, Kanban } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function MainApp() {
  const { user, logout } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  // CMD+K / CTRL+K and 'v' shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
      
      if (e.key === "v" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setViewMode(v => v === "board" ? "list" : "board");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!user) return <LoginPage />;

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground">
      {/* Minimalist Linear-style topbar */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md px-4 h-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 text-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-semibold text-[13px] tracking-wide">TaskFlow</span>
          </div>

          <div className="w-[1px] h-4 bg-border/50"></div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            <button 
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors ${viewMode === "board" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <Kanban className="w-3.5 h-3.5 opacity-70" />
              Board
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              List
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 text-[11px] text-muted-foreground">
             Press <kbd className="font-mono bg-muted/50 px-1 rounded border border-border/50">v</kbd> to toggle view
          </div>

          {/* CMD+K hint */}
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 px-2 py-1 rounded-md border border-border/40 bg-muted/20 text-[11px] text-muted-foreground hover:bg-muted/40 transition-all"
          >
            <span>Search</span>
            <kbd className="font-mono text-[9px] opacity-70">⌘K</kbd>
          </button>

          <div className="w-[1px] h-4 bg-border/50"></div>

          {/* User menu */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
              {user.fullName[0]}
            </div>
            <button
              onClick={logout}
              className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <KanbanBoard viewMode={viewMode} />
      </main>

      {/* CMD+K */}
      <CommandMenu open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}
