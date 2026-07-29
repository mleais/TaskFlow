import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { KanbanBoard } from "@/components/kanban-board";
import { LoginPage } from "@/components/login-page";
import { CommandMenu } from "@/components/command-menu";
import { CreateIssueModal } from "@/components/create-issue-modal";
import { Sidebar } from "@/components/sidebar";
import { ProjectsView } from "@/components/projects-view";
import { ActiveCycleView } from "@/components/active-cycle-view";
import { MembersView } from "@/components/members-view";
import { SettingsModal } from "@/components/settings-modal";
import { ListView } from "@/components/list-view";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function MainApp() {
  const { user } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "list" | "projects" | "cycle" | "members" | "views">("board");
  const [filterMode, setFilterMode] = useState<"all" | "my-issues">("all");
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // CMD+K / CTRL+K, 'v' and 'c' shortcuts
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

      if (e.key === "c" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setCreateIssueOpen(true);
      }

      if (e.key === "[" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setSidebarOpen(o => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!user) return <LoginPage />;

  return (
    <div className="flex h-screen w-full bg-[#0A0A0B] text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(false)} 
        onCreateIssue={() => setCreateIssueOpen(true)}
        onOpenCommandMenu={() => setCmdOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        activeView={viewMode}
        onSetViewMode={setViewMode}
        activeFilter={filterMode}
        onFilterChange={(filter) => {
          setFilterMode(filter);
          setViewMode("board"); // Reset to board view when changing inbox/my-issues
        }}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Header - Breadcrumb */}
        <header className="h-12 flex items-center justify-between px-5 border-b border-white/5 shrink-0 bg-[#0A0A0B]">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-1 rounded text-[#696C75] hover:bg-white/5 hover:text-[#E8E8ED] transition-colors"
                title="Open sidebar ([)"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 13V3C14 2.44772 13.5523 2 13 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            
            <div className="flex items-center text-[13px] font-medium text-[#9BA1A6]">
              <span className="hover:text-[#E8E8ED] cursor-pointer transition-colors">TaskFlow</span>
              <span className="mx-2 text-[#27272A]">/</span>
              <span className="hover:text-[#E8E8ED] cursor-pointer transition-colors">Your Team</span>
              <span className="mx-2 text-[#27272A]">/</span>
              <span className="text-[#E8E8ED]">{viewMode === "board" ? "Board" : viewMode === "list" ? "List" : "View"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-0.5 rounded-md bg-[#1A1B1E] border border-white/5 text-[12px] font-medium text-[#696C75]">
              <button onClick={() => setViewMode("board")} className={`px-2.5 py-1 rounded-sm transition-colors ${viewMode === "board" ? "bg-white/10 text-[#E8E8ED] shadow-sm" : "hover:text-[#9BA1A6]"}`}>Board</button>
              <button onClick={() => setViewMode("list")} className={`px-2.5 py-1 rounded-sm transition-colors ${viewMode === "list" ? "bg-white/10 text-[#E8E8ED] shadow-sm" : "hover:text-[#9BA1A6]"}`}>List</button>
            </div>
            <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
            <button
              onClick={() => setCmdOpen(true)}
              className="px-2 py-1 rounded hover:bg-white/5 transition-colors text-[#9BA1A6] hover:text-[#E8E8ED] flex items-center gap-2"
            >
              <span className="text-[12px] font-medium">Display</span>
            </button>
          </div>
        </header>

        {/* Board / List / Custom Views Area */}
        <main className="flex-1 overflow-hidden relative">
          {viewMode === "board" && (
            <KanbanBoard viewMode="board" filterMode={filterMode} />
          )}
          {viewMode === "list" && (
            <ListView filterMode={filterMode} />
          )}
          {viewMode === "projects" && <ProjectsView />}
          {viewMode === "cycle" && <ActiveCycleView />}
          {viewMode === "members" && <MembersView />}
          {viewMode === "views" && (
            <ListView filterMode={filterMode} />
          )}
        </main>
      </div>

      {/* CMD+K */}
      <CommandMenu 
        open={cmdOpen} 
        onClose={() => setCmdOpen(false)} 
        onCreateIssue={() => setCreateIssueOpen(true)}
        onSetViewMode={setViewMode}
      />
      
      {/* Create Issue Modal */}
      {createIssueOpen && <CreateIssueModal onClose={() => setCreateIssueOpen(false)} />}

      {/* Settings Modal */}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
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
