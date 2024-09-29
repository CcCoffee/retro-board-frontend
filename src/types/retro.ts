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

export const typesInfo = [
  { id: "good", title: "Good", color: "bg-green-100", indicatorColor: "bg-green-300" },
  { id: "keep", title: "Keep", color: "bg-blue-100", indicatorColor: "bg-blue-300" },
  { id: "change", title: "Change", color: "bg-yellow-100", indicatorColor: "bg-yellow-300" },
  { id: "bad", title: "Bad", color: "bg-red-100", indicatorColor: "bg-red-300" },
]