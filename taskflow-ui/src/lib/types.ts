export type IssueStatus = "Backlog" | "Todo" | "In Progress" | "In Review" | "Done";
export type IssueType = "Feature" | "Bug" | "Task";
export type IssuePriority = 0 | 1 | 2 | 3 | 4; // 0: NoPriority, 1: Low, 2: Medium, 3: High, 4: Urgent

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  projectKey: string;
  issues: Issue[];
}

export interface Cycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  projectId: string;
  project?: Project;
  issues: Issue[];
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

export type RelationType = 0 | 1 | 2 | 3; // 0: Blocks, 1: BlockedBy, 2: DuplicateOf, 3: RelatesTo

export interface IssueRelation {
  id: string;
  sourceIssueId: string;
  targetIssueId: string;
  type: RelationType;
  targetIssue?: Issue; // Navigation property if included
  sourceIssue?: Issue; // Navigation property if included
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  projectKey: string;
  issueNumber: number;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  dueDate?: string;
  estimatedTimeInMinutes: number;
  loggedTimeInMinutes: number;
  assignee?: User;
  subTasks: SubTask[];
  comments: Comment[];
  attachments: Attachment[];
  sourceRelations?: IssueRelation[];
  targetRelations?: IssueRelation[];
}

export interface AuthUser {
  token: string;
  fullName: string;
  email: string;
  userId: string;
  avatarUrl?: string;
}
