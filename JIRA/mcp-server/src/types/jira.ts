/**
 * JIRA API Type Definitions
 * Covers both Cloud (v3) and Server (v2) API formats
 */

export interface JiraConfig {
  baseUrl: string;
  userEmail: string;
  apiToken: string;
  type: 'cloud' | 'server';
  authType: 'basic' | 'bearer';
}

export interface JiraUser {
  accountId?: string;
  key?: string;
  name?: string;
  emailAddress: string;
  displayName: string;
  active: boolean;
}

export interface JiraIssueType {
  id: string;
  name: string;
  description: string;
  subtask: boolean;
}

export interface JiraStatus {
  id: string;
  name: string;
  statusCategory: {
    id: number;
    key: string;
    name: string;
  };
}

export interface JiraPriority {
  id: string;
  name: string;
  iconUrl?: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

export interface JiraComment {
  id: string;
  author: {
    displayName: string;
    emailAddress?: string;
    accountId?: string;
  };
  body: any; // ADF format or plain text
  created: string;
  updated: string;
}

export interface JiraIssueFields {
  summary: string;
  description?: any; // ADF format or plain text
  issuetype: JiraIssueType;
  project: JiraProject;
  assignee?: JiraUser | null;
  reporter?: JiraUser;
  priority?: JiraPriority;
  status: JiraStatus;
  created: string;
  updated: string;
  labels?: string[];
  components?: Array<{ name: string }>;
  fixVersions?: Array<{ name: string }>;
  duedate?: string;
  [key: string]: any; // Custom fields
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
}

export interface JiraSearchResult {
  total?: number; // Deprecated in new API, may not be present
  maxResults: number;
  startAt?: number; // Deprecated in new API
  nextPageToken?: string; // New pagination token for /rest/api/3/search/jql
  issues: JiraIssue[];
}

export interface JiraCreateIssueInput {
  projectKey: string;
  issueType: string;
  summary: string;
  description?: string;
  assigneeEmail?: string;
  priority?: string;
  labels?: string[];
  dueDate?: string;
  parentKey?: string;
}

export interface JiraUpdateIssueInput {
  summary?: string;
  description?: string;
  assigneeEmail?: string;
  priority?: string;
  labels?: string[];
  status?: string;
  [key: string]: any;
}

export interface JiraErrorResponse {
  errorMessages?: string[];
  errors?: Record<string, string>;
  message?: string;
}

export interface CleanedIssue {
  key: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  reporter: string;
  created: string;
  updated: string;
  issueType: string;
  project: string;
  labels: string[];
  comments: Array<{
    author: string;
    body: string;
    created: string;
  }>;
}
