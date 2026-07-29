import { Zap, Inbox, FileText, View, FolderKanban, Users, Settings, Plus, PanelLeftClose, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onCreateIssue: () => void;
  activeView: string;
}

export function Sidebar({ isOpen, onToggle, onCreateIssue, activeView }: SidebarProps) {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="w-[240px] shrink-0 h-full bg-[#1A1B1E] border-r border-border/40 flex flex-col text-[#9BA1A6] font-sans transition-all duration-200">
      {/* Workspace Selector */}
      <div className="h-12 flex items-center justify-between px-3 hover:bg-white/5 transition-colors cursor-pointer group">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[4px] bg-[#5E6AD2] flex items-center justify-center text-white">
            <Zap className="w-3 h-3 fill-current" />
          </div>
          <span className="text-[13px] font-medium text-[#E8E8ED]">TaskFlow</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Close sidebar ([)"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-5 px-3">
        {/* Create button */}
        <button 
          onClick={onCreateIssue}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-[13px] font-medium transition-colors text-[#E8E8ED]"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5" />
          </div>
          New issue
        </button>

        {/* Section 1 */}
        <div className="flex flex-col gap-0.5">
          <NavItem icon={<Inbox className="w-3.5 h-3.5" />} label="Inbox" />
          <NavItem icon={<FileText className="w-3.5 h-3.5" />} label="My Issues" badge="3" />
          <NavItem icon={<View className="w-3.5 h-3.5" />} label="Views" active={activeView === "views"} />
        </div>

        {/* Section 2 - Team */}
        <div>
          <div className="px-2 mb-1 flex items-center justify-between group cursor-pointer">
            <span className="text-[11px] font-semibold tracking-wider text-[#696C75]">Your Team</span>
            <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
          </div>
          <div className="flex flex-col gap-0.5">
            <NavItem icon={<Zap className="w-3.5 h-3.5" />} label="Active cycle" />
            <NavItem icon={<FolderKanban className="w-3.5 h-3.5" />} label="Projects" />
            <NavItem icon={<Users className="w-3.5 h-3.5" />} label="Members" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/20">
        <div className="flex items-center justify-between px-2 py-1.5 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-500/30">
              {user?.fullName?.[0]}
            </div>
            <span className="text-[13px] font-medium text-[#E8E8ED]">{user?.fullName?.split(' ')[0]}</span>
          </div>
          <Settings className="w-3.5 h-3.5 text-[#696C75]" />
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, badge, active }: { icon: React.ReactNode; label: string; badge?: string; active?: boolean }) {
  return (
    <button className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] transition-colors ${active ? "bg-white/10 text-[#E8E8ED]" : "hover:bg-white/5 hover:text-[#E8E8ED]"}`}>
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center w-4 h-4 ${active ? "text-[#E8E8ED]" : "text-[#696C75]"}`}>
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      {badge && <span className="text-[11px] px-1.5 rounded bg-white/10 font-mono text-[#E8E8ED]">{badge}</span>}
    </button>
  );
}
