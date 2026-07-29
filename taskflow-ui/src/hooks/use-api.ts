import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Issue, IssueStatus } from "@/lib/types";

// ─── ISSUES ──────────────────────────────────────────────────────────────────

const parseIssue = (issue: any): Issue => {
  const statusMap: Record<number, IssueStatus> = {
    0: "Backlog",
    1: "Todo",
    2: "In Progress",
    3: "In Review",
    4: "Done",
  };
  return {
    ...issue,
    status: typeof issue.status === "number" ? statusMap[issue.status] || "Todo" : issue.status,
  };
};

export function useIssues() {
  return useQuery<Issue[]>({
    queryKey: ["issues"],
    queryFn: async () => {
      const res = await api.get("/api/issues/");
      return res.data.map(parseIssue);
    },
  });
}

export function useIssue(id: string) {
  return useQuery<Issue>({
    queryKey: ["issues", id],
    queryFn: async () => {
      const res = await api.get(`/api/issues/${id}`);
      return parseIssue(res.data);
    },
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, description, priority, type }: { title: string; description: string; priority: number; type: string }) => {
      const res = await api.post("/api/issues/", { 
        title, 
        description, 
        priority, 
        type, 
        projectKey: "TSK" // Default project key for now
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] }),
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

export function useUpdateIssuePriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, priority }: { issueId: string; priority: number }) => {
      await api.patch(`/api/issues/${issueId}/priority`, { priority });
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

// ─── NEW MODULES (PROJECTS, CYCLES, MEMBERS) ─────────────────────────────────

export function useProjects() {
  return useQuery<import("@/lib/types").Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/api/projects/");
      return res.data;
    },
  });
}

export function useCycles() {
  return useQuery<import("@/lib/types").Cycle[]>({
    queryKey: ["cycles"],
    queryFn: async () => {
      const res = await api.get("/api/cycles/");
      return res.data;
    },
  });
}

export function useMembers() {
  return useQuery<import("@/lib/types").User[]>({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await api.get("/api/users/");
      return res.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fullName: string) => {
      const res = await api.put("/api/users/me", { fullName });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<{ avatarUrl: string }>("/api/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await api.post<{ message: string }>("/api/users/invite", { email });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}
