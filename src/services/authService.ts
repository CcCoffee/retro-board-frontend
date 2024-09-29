import { User } from "@/types/retro";

export const authService = {
  login: async (username: string, password: string): Promise<User> => {
    // 这里应该是实际的登录API调用
    // 为了演示,我们直接返回一个模拟用户
    return {
      id: "0",
      name: username,
      avatar: "/placeholder.svg?height=32&width=32",
      email: `${username}@example.com`,
    };
  },

  logout: async (): Promise<void> => {
    // 这里应该是实际的登出API调用
    localStorage.removeItem("user");
  },

  getCurrentUser: (): User | null => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  },

  setCurrentUser: (user: User): void => {
    localStorage.setItem("user", JSON.stringify(user));
  },
};