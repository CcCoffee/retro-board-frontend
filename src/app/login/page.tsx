"use client"

import { useState, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { authService } from "@/services/authService"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    if (username && password) {
      try {
        const user = await authService.login(username, password)
        authService.setCurrentUser(user)
        router.push("/") // 登录成功后重定向到主页
      } catch (error) {
        console.error("登录失败:", error)
        // 这里可以添加错误处理,比如显示错误消息
      }
    }
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div className="relative flex items-center justify-center flex-grow min-h-screen bg-gradient-to-r from-red-600 to-purple-400 overflow-hidden">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
      <div className="absolute inset-0 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>
      <div className="relative z-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75"></div>
        <Card className="relative w-[350px] bg-white shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center font-heading text-gray-800">Retro Board</h2>
          </CardHeader>
          <CardContent>
            <Input 
              placeholder="用户名" 
              className="mb-4" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Input 
              type="password" 
              placeholder="密码" 
              className="mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleLogin} 
              disabled={!username || !password}
            >
              登录
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}