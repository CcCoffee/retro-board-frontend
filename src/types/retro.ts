export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface RetroCard {
  id: string;
  type: string;
  content: string;
  isAnonymous: boolean;
  author: string;
  likes: string[];
}

export interface ActionItem {
  id: string;
  assignee: string;
  dueDate: string;
  content: string;
}
