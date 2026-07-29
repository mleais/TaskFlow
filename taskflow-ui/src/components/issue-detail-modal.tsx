import { useState } from "react";
import { X, CheckSquare, Square, Plus, Paperclip, Clock, Send, Upload } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import type { Issue } from "@/lib/types";
import {
  useCreateSubTask,
  useToggleSubTask,
  useCreateComment,
  useUploadAttachment,
  useLogEffort,
} from "@/hooks/use-api";


interface IssueDetailModalProps {
  issue: Issue;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  Backlog: "bg-slate-500/20 text-slate-400",
  Todo: "bg-blue-500/20 text-blue-400",
  "In Progress": "bg-amber-500/20 text-amber-400",
  "In Review": "bg-purple-500/20 text-purple-400",
  Done: "bg-green-500/20 text-green-400",
};

export function IssueDetailModal({ issue, onClose }: IssueDetailModalProps) {
  const [newSubTask, setNewSubTask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [effortMinutes, setEffortMinutes] = useState("");
  const [activeTab, setActiveTab] = useState<"subtasks" | "comments" | "attachments" | "effort">("subtasks");

  const createSubTask = useCreateSubTask();
  const toggleSubTask = useToggleSubTask();
  const createComment = useCreateComment();
  const uploadAttachment = useUploadAttachment();
  const logEffort = useLogEffort();

  const completedCount = issue.subTasks?.filter((s) => s.isCompleted).length ?? 0;
  const totalCount = issue.subTasks?.length ?? 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddSubTask = async () => {
    if (!newSubTask.trim()) return;
    await createSubTask.mutateAsync({ issueId: issue.id, title: newSubTask.trim() });
    setNewSubTask("");
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await createComment.mutateAsync({ issueId: issue.id, text: newComment.trim() });
    setNewComment("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAttachment.mutateAsync({ issueId: issue.id, file });
  };

  const handleLogEffort = async () => {
    const min = parseInt(effortMinutes);
    if (isNaN(min) || min <= 0) return;
    await logEffort.mutateAsync({ issueId: issue.id, minutesToLog: min });
    setEffortMinutes("");
  };

  const formatMinutes = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}dk`;
    if (m === 0) return `${h}sa`;
    return `${h}sa ${m}dk`;
  };

  // @mention regex highlight
  const highlightMentions = (text: string) =>
    text.split(/(@\w+)/g).map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="text-violet-400 font-medium">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-end bg-background/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl h-full bg-card border-l border-border/50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12px] font-mono text-muted-foreground uppercase tracking-wider">{issue.projectKey}-{issue.issueNumber}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColors[issue.status] || "bg-muted text-muted-foreground"}`}>
                {issue.status}
              </span>
            </div>
            <h2 className="text-xl font-semibold leading-snug text-foreground/90">{issue.title}</h2>
            {issue.description && (
              <p className="text-[13px] text-muted-foreground mt-3 font-sans leading-relaxed">{issue.description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/40 px-6 shrink-0 bg-muted/5">
          {(["subtasks", "comments", "attachments", "effort"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground/80"
              }`}
            >
              {tab === "subtasks" && "Alt Görevler"}
              {tab === "comments" && "Yorumlar"}
              {tab === "attachments" && "Dosyalar"}
              {tab === "effort" && "Efor"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* SubTasks */}
          {activeTab === "subtasks" && (
            <div>
              {totalCount > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{completedCount}/{totalCount} tamamlandı</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2 mb-4">
                {issue.subTasks?.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => toggleSubTask.mutate(st.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    {st.isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-violet-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-foreground" />
                    )}
                    <span className={`text-sm ${st.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {st.title}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newSubTask}
                  onChange={(e) => setNewSubTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubTask()}
                  placeholder="Alt görev ekle..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
                <button
                  onClick={handleAddSubTask}
                  disabled={!newSubTask.trim() || createSubTask.isPending}
                  className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          {activeTab === "comments" && (
            <div>
              <div className="space-y-4 mb-4 max-h-72 overflow-y-auto">
                {issue.comments?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Henüz yorum yok</p>
                )}
                {issue.comments?.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {c.user?.fullName?.[0] ?? "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{c.user?.fullName ?? "Kullanıcı"}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{highlightMentions(c.text)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Yorum yaz... (@mention desteklenir)"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || createComment.isPending}
                  className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Attachments */}
          {activeTab === "attachments" && (
            <div>
              <div className="space-y-2 mb-4">
                {issue.attachments?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Henüz dosya eklenmemiş</p>
                )}
                {issue.attachments?.map((att) => (
                  <div key={att.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
                    <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{att.fileName}</p>
                      <p className="text-xs text-muted-foreground">{(att.fileSizeInBytes / 1024).toFixed(1)} KB</p>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_URL || "https://localhost:7143"}${att.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >
                      İndir
                    </a>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploadAttachment.isPending ? "Yükleniyor..." : "Dosya seç veya sürükle"}
                </span>
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {/* Effort */}
          {activeTab === "effort" && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Tahmini Efor</p>
                  <p className="text-2xl font-bold">{formatMinutes(issue.estimatedTimeInMinutes)}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Harcanan Efor</p>
                  <p className="text-2xl font-bold text-violet-400">{formatMinutes(issue.loggedTimeInMinutes)}</p>
                </div>
              </div>
              {issue.estimatedTimeInMinutes > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>İlerleme</span>
                    <span>{Math.min(100, Math.round((issue.loggedTimeInMinutes / issue.estimatedTimeInMinutes) * 100))}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
                      style={{ width: `${Math.min(100, (issue.loggedTimeInMinutes / issue.estimatedTimeInMinutes) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="number"
                  value={effortMinutes}
                  onChange={(e) => setEffortMinutes(e.target.value)}
                  placeholder="Dakika cinsinden (ör: 90)"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
                <button
                  onClick={handleLogEffort}
                  disabled={!effortMinutes || logEffort.isPending}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Kaydet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
