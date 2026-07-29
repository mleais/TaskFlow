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

  // CMD+K / CTRL+K kısayolu
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!user) return <LoginPage />;

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground">
      {/* Sidebar-style topbar */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm px-5 py-3 flex items-center gap-4 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">TaskFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-500/10 text-violet-400">
            <Kanban className="w-4 h-4" />
            Kanban
          </button>
        </nav>

        {/* CMD+K hint */}
        <button
          onClick={() => setCmdOpen(true)}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:border-violet-500/50 hover:text-foreground transition-all"
        >
          <span>Komutlar</span>
          <kbd className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">⌘K</kbd>
        </button>

        {/* User menu */}
        <div className="flex items-center gap-2 pl-3 border-l border-border/50">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
            {user.fullName[0]}
          </div>
          <span className="text-sm font-medium hidden md:block">{user.fullName}</span>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground ml-1"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <KanbanBoard />
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
