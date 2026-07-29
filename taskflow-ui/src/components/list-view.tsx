import { useIssues } from "@/hooks/use-api";
import { Loader2, AlertCircle, CheckCircle2, Circle } from "lucide-react";

interface ListViewProps {
  filterMode?: "all" | "my-issues";
}

export function ListView({ filterMode = "all" }: ListViewProps) {
  const { data: issues, isLoading } = useIssues();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0B] h-full">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  // Filter based on filterMode if needed, assuming useIssues fetches all.
  const displayedIssues = (issues || []).filter(issue => {
    if (filterMode === "my-issues") {
      // In a real app we'd filter by logged in user ID, but this is a placeholder
      return issue.assignee !== null;
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Backlog":
      case "Todo": return <Circle className="w-3.5 h-3.5 text-[#696C75]" />;
      case "In Progress":
      case "In Review": return <Circle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10" />;
      case "Done": return <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />;
      default: return <Circle className="w-3.5 h-3.5" />;
    }
  };

  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 0: return <AlertCircle className="w-3.5 h-3.5 text-[#696C75]" />;
      case 1:
      case 2: return <AlertCircle className="w-3.5 h-3.5 text-orange-400" />;
      case 3:
      case 4: return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0B] p-8 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#E8E8ED]">Issues List</h2>
      </div>
      
      <div className="bg-[#141517] border border-white/5 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs font-medium text-[#696C75] uppercase tracking-wider bg-black/20">
              <th className="px-4 py-3 w-16">ID</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 w-32">Status</th>
              <th className="px-4 py-3 w-24">Priority</th>
              <th className="px-4 py-3 w-32 text-right">Assignee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayedIssues.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#9BA1A6]">
                  No issues found.
                </td>
              </tr>
            )}
            {displayedIssues.map((issue) => (
              <tr key={issue.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                <td className="px-4 py-3 text-sm font-medium text-[#9BA1A6]">
                  {issue.projectKey}-{issue.issueNumber}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[#E8E8ED]">
                  {issue.title}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-[#9BA1A6]">
                    {getStatusIcon(issue.status)}
                    {issue.status}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/5 border border-white/5">
                    {getPriorityIcon(issue.priority)}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {issue.assignee ? (
                    <div className="flex items-center justify-end gap-2 text-sm text-[#9BA1A6]">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-[10px] font-bold">
                        {issue.assignee.fullName[0]}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-[#696C75]">Unassigned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
