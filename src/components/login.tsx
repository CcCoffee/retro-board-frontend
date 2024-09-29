"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface LoginProps {
  onLogin: (username: string) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    if (username && password) {
      onLogin(username)
    }
  }

  return (
    <div className="flex items-center justify-center flex-grow">
      <Card className="w-[350px]">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center font-heading">Login</h2>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder="Username" 
            className="mb-4" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input 
            type="password" 
            placeholder="Password" 
            className="mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleLogin} 
            disabled={!username || !password}
          >
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}