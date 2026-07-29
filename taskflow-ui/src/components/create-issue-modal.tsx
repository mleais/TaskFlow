import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateIssue } from "@/hooks/use-api";

interface CreateIssueModalProps {
  onClose: () => void;
}

export function CreateIssueModal({ onClose }: CreateIssueModalProps) {
  const createIssue = useCreateIssue();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<number>(0);
  const [type, setType] = useState("Feature");

  // Prevent background scrolling and handle escape
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await createIssue.mutateAsync({ title, description, priority, type });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-2xl bg-card border border-border/50 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-foreground">New Issue</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Issue title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground/50 text-foreground"
            autoFocus
          />
          
          <textarea
            placeholder="Add description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent text-[13px] outline-none resize-none h-32 placeholder:text-muted-foreground/50 text-foreground/90 font-sans"
          />

          <div className="flex items-center gap-4 mt-2 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-muted-foreground tracking-wider">PRIORITY</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="bg-muted/50 border border-border/50 text-[12px] rounded-md px-2 py-1 text-foreground outline-none focus:border-primary/50"
              >
                <option value={0}>No Priority</option>
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
                <option value={4}>Urgent</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-muted-foreground tracking-wider">TYPE</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-muted/50 border border-border/50 text-[12px] rounded-md px-2 py-1 text-foreground outline-none focus:border-primary/50"
              >
                <option value="Feature">Feature</option>
                <option value="Bug">Bug</option>
                <option value="Task">Task</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-[13px] font-medium hover:bg-muted text-muted-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createIssue.isPending || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createIssue.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
