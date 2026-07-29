import { useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Loader2, AlertCircle, CheckSquare } from "lucide-react";
import { useIssues, useUpdateIssueStatus } from "@/hooks/use-api";
import type { Issue, IssueStatus } from "@/lib/types";
import { IssueDetailModal } from "@/components/issue-detail-modal";

const columns: IssueStatus[] = ["Backlog", "Todo", "In Progress", "In Review", "Done"];

const statusColors: Record<IssueStatus, string> = {
  Backlog: "text-slate-400",
  Todo: "text-blue-400",
  "In Progress": "text-amber-400",
  "In Review": "text-purple-400",
  Done: "text-green-400",
};

const columnDotColors: Record<IssueStatus, string> = {
  Backlog: "bg-slate-500",
  Todo: "bg-blue-500",
  "In Progress": "bg-amber-500",
  "In Review": "bg-purple-500",
  Done: "bg-green-500",
};

function IssueCard({ issue, onClick }: { issue: Issue; onClick: () => void }) {
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
      className="bg-card border border-border/50 rounded-xl p-3.5 mb-2.5 shadow-sm cursor-pointer hover:border-violet-500/40 hover:shadow-violet-500/5 hover:shadow-lg transition-all group"
    >
      <div className="text-xs font-mono text-muted-foreground mb-1.5">
        {issue.projectKey}-{issue.issueNumber}
      </div>
      <div className="text-sm font-medium leading-snug group-hover:text-foreground transition-colors mb-2">
        {issue.title}
      </div>
      {(totalSubTasks > 0 || issue.comments?.length > 0) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30">
          {totalSubTasks > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              {completedSubTasks}/{totalSubTasks}
            </span>
          )}
          {(issue.comments?.length ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              💬 {issue.comments.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function KanbanBoard() {
  const { data: issues, isLoading, isError } = useIssues();
  const updateStatus = useUpdateIssueStatus();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
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

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full w-full gap-4 p-5 overflow-x-auto">
          {columns.map((column) => {
            const columnIssues = issues.filter((i) => i.status === column);
            return (
              <div key={column} className="flex flex-col w-72 shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2 h-2 rounded-full ${columnDotColors[column]}`} />
                  <h3 className={`font-semibold text-sm ${statusColors[column]}`}>{column}</h3>
                  <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {columnIssues.length}
                  </span>
                </div>

                <SortableContext
                  id={column}
                  items={columnIssues.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 rounded-xl p-2 min-h-[120px] bg-muted/30 border border-border/20">
                    {columnIssues.map((issue) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        onClick={() => setSelectedIssue(issue)}
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
            <div className="bg-card border-2 border-violet-500/50 rounded-xl p-3.5 shadow-2xl shadow-violet-500/20 rotate-2 opacity-95 w-72">
              <div className="text-xs font-mono text-muted-foreground mb-1">{activeIssue.projectKey}-{activeIssue.issueNumber}</div>
              <div className="text-sm font-medium">{activeIssue.title}</div>
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
    </>
  );
}
