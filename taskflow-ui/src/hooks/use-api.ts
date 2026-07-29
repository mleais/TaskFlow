import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Issue, IssueStatus } from "@/lib/types";

// ─── ISSUES ──────────────────────────────────────────────────────────────────

export function useIssues() {
  return useQuery<Issue[]>({
    queryKey: ["issues"],
    queryFn: async () => {
      const res = await api.get("/api/issues/");
      return res.data;
    },
  });
}

export function useIssue(id: string) {
  return useQuery<Issue>({
    queryKey: ["issues", id],
    queryFn: async () => {
      const res = await api.get(`/api/issues/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useUpdateIssueStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, status }: { issueId: string; status: IssueStatus }) => {
      const statusMap: Record<IssueStatus, number> = {
        Backlog: 0,
        Todo: 1,
        "In Progress": 2,
        "In Review": 3,
        Done: 4,
      };
      await api.patch(`/api/issues/${issueId}/status`, { status: statusMap[status] });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] }),
  });
}

export function useLogEffort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, minutesToLog }: { issueId: string; minutesToLog: number }) => {
      await api.post(`/api/issues/${issueId}/effort`, { minutesToLog });
    },
    onSuccess: (_d, vars) => queryClient.invalidateQueries({ queryKey: ["issues", vars.issueId] }),
  });
}

// ─── SUBTASKS ────────────────────────────────────────────────────────────────

export function useCreateSubTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, title }: { issueId: string; title: string }) => {
      const res = await api.post("/api/subtasks/", { issueId, title });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] }),
  });
}

export function useToggleSubTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subTaskId: string) => {
      await api.patch(`/api/subtasks/${subTaskId}/toggle`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] }),
  });
}

// ─── COMMENTS ────────────────────────────────────────────────────────────────

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, text }: { issueId: string; text: string }) => {
      const res = await api.post("/api/comments/", { issueId, text });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] }),
  });
}

// ─── ATTACHMENTS ─────────────────────────────────────────────────────────────

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, file }: { issueId: string; file: File }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("issueId", issueId);
      const res = await api.post("/api/attachments/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] }),
  });
}
