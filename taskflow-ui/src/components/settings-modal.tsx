import { useState } from "react";
import { X, User, Users, Monitor, Building2, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { MembersView } from "./members-view";

interface SettingsModalProps {
  onClose: () => void;
}

type Tab = "profile" | "preferences" | "workspace" | "members";

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[85vh] bg-[#1A1B1E] border border-white/10 rounded-xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Settings Sidebar */}
        <div className="w-64 shrink-0 bg-[#141517] border-r border-white/5 flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <h2 className="font-semibold text-[#E8E8ED]">Settings</h2>
            <button onClick={onClose} className="p-1 rounded-md text-[#9BA1A6] hover:text-[#E8E8ED] hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-6">
            <div>
              <div className="px-2 mb-2 text-xs font-semibold tracking-wider text-[#696C75] uppercase">My Account</div>
              <div className="flex flex-col gap-0.5">
                <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User className="w-4 h-4" />} label="Profile" />
                <TabButton active={activeTab === "preferences"} onClick={() => setActiveTab("preferences")} icon={<Monitor className="w-4 h-4" />} label="Preferences" />
              </div>
            </div>

            <div>
              <div className="px-2 mb-2 text-xs font-semibold tracking-wider text-[#696C75] uppercase">Workspace</div>
              <div className="flex flex-col gap-0.5">
                <TabButton active={activeTab === "workspace"} onClick={() => setActiveTab("workspace")} icon={<Building2 className="w-4 h-4" />} label="General" />
                <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")} icon={<Users className="w-4 h-4" />} label="Members" />
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-3 border-t border-white/5">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto bg-[#0A0A0B]">
          {activeTab === "profile" && (
            <div className="max-w-2xl mx-auto p-10">
              <h3 className="text-xl font-semibold text-[#E8E8ED] mb-8">Profile Settings</h3>
              
              <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/5">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl font-bold">
                  {user?.fullName?.[0]}
                </div>
                <div>
                  <button className="bg-white/10 hover:bg-white/20 text-[#E8E8ED] px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Upload new avatar
                  </button>
                  <p className="text-xs text-[#696C75] mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#9BA1A6] mb-2">Full Name</label>
                  <input type="text" defaultValue={user?.fullName} className="w-full bg-[#1C1C1E] border border-white/10 rounded-md px-3 py-2 text-[#E8E8ED] focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9BA1A6] mb-2">Email Address</label>
                  <input type="email" defaultValue={user?.email} className="w-full bg-[#1C1C1E] border border-white/10 rounded-md px-3 py-2 text-[#E8E8ED] focus:outline-none focus:border-indigo-500/50" readOnly />
                </div>
                <div className="pt-4">
                  <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="max-w-2xl mx-auto p-10">
              <h3 className="text-xl font-semibold text-[#E8E8ED] mb-8">Preferences</h3>
              <p className="text-[#9BA1A6] text-sm">Theme settings and notifications will appear here.</p>
            </div>
          )}

          {activeTab === "workspace" && (
            <div className="max-w-2xl mx-auto p-10">
              <h3 className="text-xl font-semibold text-[#E8E8ED] mb-8">Workspace General</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#9BA1A6] mb-2">Workspace Name</label>
                  <input type="text" defaultValue="TaskFlow Team" className="w-full bg-[#1C1C1E] border border-white/10 rounded-md px-3 py-2 text-[#E8E8ED] focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9BA1A6] mb-2">Workspace URL</label>
                  <div className="flex items-center">
                    <span className="bg-[#141517] border border-r-0 border-white/10 rounded-l-md px-3 py-2 text-[#696C75] text-sm">taskflow.app/</span>
                    <input type="text" defaultValue="team" className="flex-1 bg-[#1C1C1E] border border-white/10 rounded-r-md px-3 py-2 text-[#E8E8ED] focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="h-full">
               <MembersView isEmbedded />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
        active ? "bg-white/10 text-[#E8E8ED]" : "text-[#9BA1A6] hover:bg-white/5 hover:text-[#E8E8ED]"
      }`}
    >
      <div className={active ? "text-[#E8E8ED]" : "text-[#696C75]"}>{icon}</div>
      {label}
    </button>
  );
}
