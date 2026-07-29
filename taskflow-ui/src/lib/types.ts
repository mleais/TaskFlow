export type IssueStatus = "Backlog" | "Todo" | "In Progress" | "In Review" | "Done";
export type IssueType = "Feature" | "Bug" | "Task";

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  issueId: string;
}

export interface Comment {
  id: string;
  text: string;
  issueId: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileSizeInBytes: number;
  contentType: string;
  issueId: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  projectKey: string;
  issueNumber: number;
  type: IssueType;
  status: IssueStatus;
  dueDate?: string;
  estimatedTimeInMinutes: number;
  loggedTimeInMinutes: number;
  assignee?: User;
  subTasks: SubTask[];
  comments: Comment[];
  attachments: Attachment[];
}

export interface AuthUser {
  token: string;
  fullName: string;
  email: string;
  userId: string;
}
