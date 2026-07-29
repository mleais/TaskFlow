import { useIssues, useUpdateIssueStatus } from "@/hooks/use-api";
import { Loader2, Inbox, Check, X } from "lucide-react";
import { IssueDetailModal } from "./issue-detail-modal";
import { useState } from "react";
import type { Issue } from "@/lib/types";

export function TriageView() {
  const { data: issues, isLoading } = useIssues();
  const updateStatus = useUpdateIssueStatus();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0B] h-full">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  // Linear's Triage usually means "Backlog" or unassigned/un-triaged issues.
  // We'll consider "Backlog" issues as needing Triage.
  const triageIssues = issues?.filter(i => i.status === "Backlog") || [];

  return (
    <div className="flex flex-col h-full bg-[#0A0A0B] p-8 overflow-y-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Inbox className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#E8E8ED]">Triage</h2>
          <p className="text-sm text-[#9BA1A6]">Review new issues and decide their fate.</p>
        </div>
      </div>

      <div className="bg-[#141517] border border-white/5 rounded-lg overflow-hidden flex-1">
        {triageIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-12">
            <Check className="w-12 h-12 text-green-500/50" />
            <p className="text-[#9BA1A6] font-medium">Inbox zero!</p>
            <p className="text-xs text-[#696C75]">No issues need triage right now.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs font-medium text-[#696C75] uppercase tracking-wider bg-black/20">
                <th className="px-4 py-3 w-16">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {triageIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td 
                    className="px-4 py-3 text-sm font-medium text-[#9BA1A6] cursor-pointer"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    {issue.projectKey}-{issue.issueNumber}
                  </td>
                  <td 
                    className="px-4 py-3 text-sm font-medium text-[#E8E8ED] cursor-pointer"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    {issue.title}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => updateStatus.mutate({ issueId: issue.id, status: "Todo" })}
                        className="px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Accept
                      </button>
                      <button 
                        onClick={() => updateStatus.mutate({ issueId: issue.id, status: "Done" })}
                        className="px-3 py-1.5 rounded bg-white/5 text-[#9BA1A6] hover:bg-white/10 hover:text-white text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}
