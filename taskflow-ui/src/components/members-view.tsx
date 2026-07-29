import { useState } from "react";
import { useMembers, useInviteMember } from "@/hooks/use-api";
import { Users, Loader2, Mail, Plus } from "lucide-react";

export function MembersView({ isEmbedded }: { isEmbedded?: boolean }) {
  const { data: members, isLoading } = useMembers();
  const inviteMember = useInviteMember();
  const [inviteEmail, setInviteEmail] = useState("");

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/50" />
      </div>
    );
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      inviteMember.mutate(inviteEmail, {
        onSuccess: () => {
          setInviteEmail("");
          alert("Invite sent successfully!");
        }
      });
    }
  };

  return (
    <div className={`flex flex-col h-full overflow-y-auto ${isEmbedded ? "p-10" : "bg-[#0A0A0B] p-8"}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-md">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold text-[#E8E8ED]">Members</h1>
        </div>
        <form onSubmit={handleInvite} className="flex items-center gap-2">
          <input 
            type="email" 
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email address"
            required
            className="bg-[#1C1C1E] border border-white/10 rounded-md px-3 py-2 text-sm text-[#E8E8ED] focus:outline-none focus:border-emerald-500/50 w-64"
          />
          <button 
            type="submit"
            disabled={inviteMember.isPending}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            {inviteMember.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Invite Member
          </button>
        </form>
      </div>

      <div className="bg-[#1C1C1E] border border-[#27282b] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs font-medium text-[#696C75] uppercase tracking-wider bg-black/20">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 text-right">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-[#9BA1A6]">
                  No members found.
                </td>
              </tr>
            )}
            {members?.map((member) => (
              <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      {member.fullName[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-[#E8E8ED] group-hover:text-emerald-400 transition-colors">
                      {member.fullName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-[#9BA1A6]">
                    <Mail className="w-3.5 h-3.5" />
                    {member.email}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white/5 text-[#9BA1A6] border border-white/10">
                    Member
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
