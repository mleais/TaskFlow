import { useState, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Loader2, AlertCircle, CheckSquare, MessageSquare, AlertTriangle, ArrowUpRight, ArrowRight, ArrowDownRight, Circle } from "lucide-react";
import { useIssues, useUpdateIssueStatus, useUpdateIssuePriority } from "@/hooks/use-api";
import { useAuth } from "@/contexts/auth-context";
import type { Issue, IssueStatus, IssuePriority } from "@/lib/types";
import { IssueDetailModal } from "@/components/issue-detail-modal";

const columns: IssueStatus[] = ["Backlog", "Todo", "In Progress", "In Review", "Done"];

function PriorityIcon({ priority }: { priority: IssuePriority }) {
  switch (priority) {
    case 4: return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
    case 3: return <ArrowUpRight className="w-3.5 h-3.5 text-orange-500" />;
    case 2: return <ArrowRight className="w-3.5 h-3.5 text-blue-400" />;
    case 1: return <ArrowDownRight className="w-3.5 h-3.5 text-muted-foreground" />;
    default: return <Circle className="w-3.5 h-3.5 text-muted-foreground/50" />;
  }
}

function IssueCard({ issue, onClick, onContextMenu }: { issue: Issue; onClick: () => void; onContextMenu: (e: React.MouseEvent) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id });

  const completedSubTasks = issue.subTasks?.filter((s) => s.isCompleted).length ?? 0;
  const totalSubTasks = issue.subTasks?.length ?? 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="bg-[#1C1C1E] border border-[#27282b] rounded-md p-3 cursor-pointer hover:border-[#38393d] transition-colors group flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            <PriorityIcon priority={issue.priority ?? 0} />
          </div>
          <div className="text-[13px] font-medium text-[#E8E8ED] leading-snug">
            {issue.title}
          </div>
        </div>
        <div className="text-[11px] font-mono text-[#696C75] shrink-0 pt-0.5 group-hover:text-[#9BA1A6] transition-colors">
          {issue.projectKey}-{issue.issueNumber}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-1 text-[#696C75]">
        {totalSubTasks > 0 && (
          <div className="flex items-center gap-1.5 text-[11px]">
            {completedSubTasks === totalSubTasks ? (
              <CheckSquare className="w-3.5 h-3.5 text-[#E8E8ED]" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            )}
            <span className={completedSubTasks === totalSubTasks ? "text-[#E8E8ED]" : ""}>
              {completedSubTasks}/{totalSubTasks}
            </span>
          </div>
        )}
        
        {(issue.comments?.length ?? 0) > 0 && (
          <div className="flex items-center gap-1 text-[11px]">
            <MessageSquare className="w-3 h-3" />
            <span>{issue.comments.length}</span>
          </div>
        )}
        
        {issue.assignee && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-[#E8E8ED] border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.05)]">
              {issue.assignee.fullName[0]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ viewMode = "board", filterMode = "all" }: { viewMode?: "board" | "list"; filterMode?: "all" | "my-issues" }) {
  const { data: allIssues, isLoading, isError } = useIssues();
  const updateStatus = useUpdateIssueStatus();
  const updatePriority = useUpdateIssuePriority();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; issue: Issue } | null>(null);
  const { user } = useAuth();

  const issues = allIssues ? (filterMode === "my-issues" && user ? allIssues.filter(i => i.assignee?.id === user.userId) : allIssues) : [];

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !issues) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm">API'ye bağlanılamadı. Backend çalışıyor mu?</p>
      </div>
    );
  }

  const handleDragStart = (event: any) => setActiveId(event.active.id);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const overId = over.id as string;
    const isOverColumn = (columns as string[]).includes(overId);
    if (!isOverColumn) return;

    const activeIssue = issues.find((i) => i.id === active.id);
    if (!activeIssue || activeIssue.status === overId) return;

    await updateStatus.mutateAsync({ issueId: active.id, status: overId as IssueStatus });
  };

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null;

  const handleContextMenu = (e: React.MouseEvent, issue: Issue) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, issue });
  };

  if (viewMode === "list") {
    return (
      <div className="h-full w-full overflow-y-auto bg-background p-6 relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/40 text-[11px] tracking-wider text-muted-foreground">
              <th className="pb-3 font-medium w-32">IDENTIFIER</th>
              <th className="pb-3 font-medium">TITLE</th>
              <th className="pb-3 font-medium w-32">STATUS</th>
              <th className="pb-3 font-medium w-24">PRIORITY</th>
              <th className="pb-3 font-medium w-32">ASSIGNEE</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr 
                key={issue.id} 
                onClick={() => setSelectedIssue(issue)}
                onContextMenu={(e) => handleContextMenu(e, issue)}
                className="group border-b border-border/20 hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <td className="py-3 text-[12px] font-mono text-muted-foreground group-hover:text-foreground/80">
                  {issue.projectKey}-{issue.issueNumber}
                </td>
                <td className="py-3 text-[13px] font-medium text-foreground/90">
                  {issue.title}
                </td>
                <td className="py-3 text-[12px] text-muted-foreground">
                  <span className="bg-muted px-2 py-0.5 rounded-md border border-border/50">{issue.status}</span>
                </td>
                <td className="py-3">
                  <PriorityIcon priority={issue.priority ?? 0} />
                </td>
                <td className="py-3 text-[12px] text-muted-foreground">
                  {issue.assignee ? issue.assignee.fullName : 'Unassigned'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedIssue && (
          <IssueDetailModal
            issue={selectedIssue}
            onClose={() => setSelectedIssue(null)}
          />
        )}
        {contextMenu && (
          <div 
            className="fixed z-50 bg-card border border-border/50 rounded-lg p-1.5 shadow-xl flex flex-col min-w-[180px] text-sm"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="px-2 py-1 text-[11px] font-mono text-muted-foreground border-b border-border/50 mb-1">SET PRIORITY</div>
            {[
              { level: 4, label: "Urgent", icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> },
              { level: 3, label: "High", icon: <ArrowUpRight className="w-3.5 h-3.5 text-orange-500" /> },
              { level: 2, label: "Medium", icon: <ArrowRight className="w-3.5 h-3.5 text-blue-400" /> },
              { level: 1, label: "Low", icon: <ArrowDownRight className="w-3.5 h-3.5 text-muted-foreground" /> },
              { level: 0, label: "No Priority", icon: <Circle className="w-3.5 h-3.5 text-muted-foreground/50" /> }
            ].map(p => (
              <button 
                key={p.level}
                onClick={(e) => {
                  e.stopPropagation();
                  updatePriority.mutate({ issueId: contextMenu.issue.id, priority: p.level });
                  setContextMenu(null);
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors w-full text-left"
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full w-full gap-5 p-6 overflow-x-auto bg-[#0A0A0B] relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {columns.map((column) => {
            const columnIssues = issues.filter((i) => i.status === column);
            return (
              <div key={column} className="flex flex-col w-[320px] shrink-0 border-r border-white/5 pr-5 last:border-r-0">
                <div className="flex items-center justify-between mb-4 px-1 group">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[11px] tracking-widest text-[#E8E8ED]">{column.replace(/i/g, 'I').toUpperCase()}</h3>
                    <span className="text-[10px] font-mono text-[#696C75] px-1.5 py-0.5 rounded bg-white/5">
                      {columnIssues.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[#696C75] hover:text-[#E8E8ED] transition-colors p-1 rounded hover:bg-white/10">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3.33331V12.6666M3.33331 7.99998H12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="text-[#696C75] hover:text-[#E8E8ED] transition-colors p-1 rounded hover:bg-white/10">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.33331 8H12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.33331 4H12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.33331 12H12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <SortableContext
                  id={column}
                  items={columnIssues.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={`flex-1 min-h-[200px] pb-8 flex flex-col gap-2 rounded-lg transition-colors ${activeId && !columnIssues.length ? 'border border-dashed border-white/10 bg-white/[0.02]' : ''}`}>
                    {columnIssues.map((issue) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        onClick={() => setSelectedIssue(issue)}
                        onContextMenu={(e) => handleContextMenu(e, issue)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeIssue ? (
            <div className="bg-[#1C1C1E] border border-white/10 rounded-md p-3 shadow-2xl opacity-90 w-[320px] rotate-2 scale-[1.02] flex flex-col gap-2">
               <div className="flex items-center justify-between">
                <div className="text-[12px] font-mono text-[#696C75]">
                  {activeIssue.projectKey}-{activeIssue.issueNumber}
                </div>
              </div>
              <div className="text-[13px] font-medium text-[#E8E8ED]">
                {activeIssue.title}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
      
      {contextMenu && (
        <div 
          className="fixed z-50 bg-card border border-border/50 rounded-lg p-1.5 shadow-xl flex flex-col min-w-[180px] text-[13px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-2 py-1 text-[11px] font-mono text-muted-foreground border-b border-border/50 mb-1">SET PRIORITY</div>
          {[
            { level: 4, label: "Urgent", icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> },
            { level: 3, label: "High", icon: <ArrowUpRight className="w-3.5 h-3.5 text-orange-500" /> },
            { level: 2, label: "Medium", icon: <ArrowRight className="w-3.5 h-3.5 text-blue-400" /> },
            { level: 1, label: "Low", icon: <ArrowDownRight className="w-3.5 h-3.5 text-muted-foreground" /> },
            { level: 0, label: "No Priority", icon: <Circle className="w-3.5 h-3.5 text-muted-foreground/50" /> }
          ].map(p => (
            <button 
              key={p.level}
              onClick={(e) => {
                e.stopPropagation();
                updatePriority.mutate({ issueId: contextMenu.issue.id, priority: p.level });
                setContextMenu(null);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors w-full text-left"
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
