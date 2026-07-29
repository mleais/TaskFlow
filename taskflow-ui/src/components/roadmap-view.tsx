import { useIssues } from "@/hooks/use-api";
import { Loader2, Map } from "lucide-react";
import { IssueDetailModal } from "./issue-detail-modal";
import { useState } from "react";
import type { Issue } from "@/lib/types";

export function RoadmapView() {
  const { data: issues, isLoading } = useIssues();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0B] h-full">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  // Simplified Roadmap: Q1, Q2, Q3, Q4 buckets based on some mock logic or created date.
  // Real implementation would have start/end dates on projects. We'll group by Status for a high-level view.
  const roadmapIssues = issues || [];
  
  const activeIssues = roadmapIssues.filter(i => i.status === "In Progress" || i.status === "In Review");
  const upcomingIssues = roadmapIssues.filter(i => i.status === "Todo");
  const completedIssues = roadmapIssues.filter(i => i.status === "Done");

  return (
    <div className="flex flex-col h-full bg-[#0A0A0B] p-8 overflow-y-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Map className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-[#E8E8ED]">Roadmap</h2>
          <p className="text-sm text-[#9BA1A6]">High-level overview of company initiatives.</p>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8">
        <RoadmapColumn title="Now (Active)" issues={activeIssues} onClick={setSelectedIssue} color="border-blue-500/30" />
        <RoadmapColumn title="Next (Upcoming)" issues={upcomingIssues} onClick={setSelectedIssue} color="border-orange-500/30" />
        <RoadmapColumn title="Later (Completed)" issues={completedIssues} onClick={setSelectedIssue} color="border-green-500/30" />
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

function RoadmapColumn({ title, issues, onClick, color }: { title: string, issues: Issue[], onClick: (i: Issue) => void, color: string }) {
  return (
    <div className="flex flex-col w-[350px] shrink-0">
      <div className="mb-4 flex items-center gap-2">
        <h3 className="font-semibold text-sm tracking-wide text-[#E8E8ED]">{title}</h3>
        <span className="text-[10px] font-mono text-[#696C75] px-1.5 py-0.5 rounded bg-white/5">
          {issues.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {issues.map(issue => (
          <div 
            key={issue.id} 
            onClick={() => onClick(issue)}
            className={`bg-[#141517] border-l-2 ${color} border-t border-b border-r border-white/5 rounded-md p-4 cursor-pointer hover:bg-white/[0.03] transition-colors`}
          >
            <div className="text-xs font-mono text-[#696C75] mb-2">{issue.projectKey}-{issue.issueNumber}</div>
            <div className="text-sm font-medium text-[#E8E8ED] leading-relaxed mb-3">{issue.title}</div>
            <div className="flex items-center gap-2 text-xs text-[#9BA1A6]">
              <span className="bg-white/5 px-2 py-1 rounded">{issue.status}</span>
            </div>
          </div>
        ))}
        {issues.length === 0 && (
          <div className="border border-dashed border-white/10 rounded-md p-6 text-center text-sm text-[#696C75]">
            No initiatives
          </div>
        )}
      </div>
    </div>
  );
}
