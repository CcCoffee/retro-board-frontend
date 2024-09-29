"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, HeartIcon, PencilIcon, TrashIcon } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import Login from "@/components/login"
import { authService } from "@/services/authService"
import { retroService } from "@/services/retroService"
import { User, RetroCard, ActionItem } from "@/types/retro"

const typesInfo = [
  { id: "good", title: "Good", color: "bg-green-100", indicatorColor: "bg-green-300" },
  { id: "keep", title: "Keep", color: "bg-blue-100", indicatorColor: "bg-blue-300" },
  { id: "change", title: "Change", color: "bg-yellow-100", indicatorColor: "bg-yellow-300" },
  { id: "bad", title: "Bad", color: "bg-red-100", indicatorColor: "bg-red-300" },
]

const users: User[] = [
  { id: "0", name: "Admin", avatar: "/placeholder.svg?height=32&width=32", email: "admin@example.com" },
  { id: "1", name: "Alice", avatar: "/placeholder.svg?height=32&width=32", email: "alice@example.com" },
  { id: "2", name: "Bob", avatar: "/placeholder.svg?height=32&width=32", email: "bob@example.com" },
  { id: "3", name: "Charlie", avatar: "/placeholder.svg?height=32&width=32", email: "charlie@example.com" },
]

export default function RetroBoard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [cards, setCards] = useState<RetroCard[]>([])
  const [newCard, setNewCard] = useState<Omit<RetroCard, 'id' | 'author' | 'likes'>>({ type: "good", content: "", isAnonymous: false })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [newActionItem, setNewActionItem] = useState<Omit<ActionItem, 'id'>>({ assignee: "", dueDate: "", content: "" })
  const [editingActionItem, setEditingActionItem] = useState<ActionItem | null>(null)
  const [openAssignee, setOpenAssignee] = useState(false)

  useEffect(() => {
    const checkLoginStatus = () => {
      const isUserLoggedIn = !!localStorage.getItem("user")
      setIsLoggedIn(isUserLoggedIn)
      if (isUserLoggedIn) {
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          loadData()
        }
      }
      setIsLoading(false)
    }

    checkLoginStatus()
  }, [])

  const loadData = async () => {
    const loadedCards = await retroService.getCards()
    setCards(loadedCards)

    const loadedActionItems = await retroService.getActionItems()
    setActionItems(loadedActionItems)
  }

  const isActionItemValid = newActionItem.assignee && newActionItem.content.trim() !== ""

  const isSubmitEnabled = newCard.content.trim() !== ""
  const isActionItemSubmitEnabled = isActionItemValid

  // 计算 action items 的摘要信息
  const totalActionItems = actionItems.length
  const overdueTasks = actionItems.filter(item => new Date(item.dueDate) < startOfDay(new Date())).length

  const handleLogin = async (username: string) => {
    const user = await authService.login(username, "password") // 假设密码
    setIsLoggedIn(true)
    setUser(user)
    loadData()
  }

  const handleCardSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (isSubmitEnabled && user) {
      const newCardData: RetroCard = { 
        ...newCard, 
        id: Date.now().toString(), 
        author: newCard.isAnonymous ? "Anonymous" : user.name, 
        likes: [] 
      }
      await retroService.saveCard(newCardData)
      setCards(await retroService.getCards())
      setNewCard({ type: "good", content: "", isAnonymous: false })
    }
  }

  const handleCardDelete = async (cardId: string) => {
    const updatedCards = cards.filter(card => card.id !== cardId)
    await retroService.updateCards(updatedCards)
    setCards(updatedCards)
  }

  const handleCardLike = async (cardId: string) => {
    if (!user) return
    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        const likes = card.likes.includes(user.id)
          ? card.likes.filter(id => id !== user.id)
          : [...card.likes, user.id]
        return { ...card, likes }
      }
      return card
    })
    await retroService.updateCards(updatedCards)
    setCards(updatedCards)
  }

  const handleActionItemSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (isActionItemSubmitEnabled) {
      let updatedActionItems: ActionItem[]
      if (editingActionItem) {
        updatedActionItems = actionItems.map(item =>
          item.id === editingActionItem.id ? { ...newActionItem, id: item.id } : item
        )
      } else {
        const newItem = { ...newActionItem, id: Date.now().toString() }
        updatedActionItems = [...actionItems, newItem]
        await retroService.saveActionItem(newItem)
      }
      await retroService.updateActionItems(updatedActionItems)
      setActionItems(updatedActionItems)
      setNewActionItem({ assignee: "", dueDate: "", content: "" })
      setEditingActionItem(null)
    }
  }

  const handleActionItemDelete = async (itemId: string) => {
    const updatedActionItems = actionItems.filter(item => item.id !== itemId)
    await retroService.updateActionItems(updatedActionItems)
    setActionItems(updatedActionItems)
  }

  const handleActionItemEdit = (item: ActionItem) => {
    setNewActionItem(item)
    setEditingActionItem(item)
  }

  const handleLogout = async () => {
    await authService.logout()
    setIsLoggedIn(false)
    setUser(null)
  }

  const handleCardKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isSubmitEnabled) {
      handleCardSubmit()
    }
  }

  const handleActionItemKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift + Enter 用于换行，不需要特殊处理
        return;
      } else {
        // 仅 Enter 键用于提交
        e.preventDefault(); // 阻止默认的换行行为
        if (isActionItemSubmitEnabled) {
          handleActionItemSubmit();
        }
      }
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="flex flex-col h-screen">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-2xl font-bold font-heading">Retro Board</h1>
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email ?? 'No email'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="ml-2">
                {isSidebarOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </Button>
            </div>
          </div>
          <div className="flex justify-end pt-0 px-4 pb-4 gap-2">
            <Select value={newCard.type} onValueChange={(value) => setNewCard({ ...newCard, type: value })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {typesInfo.map((typeInfo) => (
                  <SelectItem key={typeInfo.id} value={typeInfo.id} className="flex items-center">
                    <div className={`w-3 h-3 mr-2 ${typeInfo.indicatorColor} inline-block rounded-full`}></div>
                    <span className="inline">{typeInfo.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Enter your opinion"
              value={newCard.content}
              onChange={(e) => setNewCard({ ...newCard, content: e.target.value })}
              onKeyPress={handleCardKeyPress}
              className="flex-grow min-w-[200px]"
            />
            <div className="flex items-center">
              <Checkbox
                id="anonymous"
                checked={newCard.isAnonymous}
                onCheckedChange={(checked: boolean) => setNewCard({ ...newCard, isAnonymous: checked })}
              />
              <label htmlFor="anonymous" className="ml-2 hidden sm:inline">Anonymous</label>
            </div>
            <Button onClick={handleCardSubmit} disabled={!isSubmitEnabled}>Submit</Button>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 mr-4 overflow-auto">
              <div className="grid grid-cols-4 gap-4 h-full">
                {typesInfo.map((column, index) => (
                  <div key={column.id} className={`${column.color} p-4 rounded-lg overflow-auto ${index === 0 ? 'ml-4' : ''}`}>
                    <h3 className="text-lg font-bold mb-2 font-heading">{column.title}</h3>
                    {cards.filter(card => card.type === column.id).map((card) => (
                      <Card key={card.id} className="mb-2 relative">
                        <CardContent className="p-4">
                          <div className="text-xs text-gray-400 text-center mb-2">
                            — {card.author} —
                          </div>
                          <p>{card.content}</p>
                        </CardContent>
                        <div className="h-[40px] flex justify-between items-center px-4">
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCardLike(card.id)}
                              className={card.likes.includes(user.id) ? "text-red-500" : ""}
                            >
                              <HeartIcon className="h-4 w-4" />
                            </Button>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex -space-x-2 ml-2">
                                    {card.likes.slice(0, 3).map((userId) => {
                                      const likeUser = users.find(u => u.id === userId)
                                      if (likeUser) {
                                        return (
                                          <Avatar key={userId} className="w-6 h-6 border-2 border-background">
                                            <AvatarImage src={likeUser.avatar} alt={likeUser.name} />
                                            <AvatarFallback>{likeUser.name[0]}</AvatarFallback>
                                          </Avatar>
                                        )
                                      }
                                      return null
                                    })}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="flex flex-col">
                                    {card.likes.map(userId => {
                                      const likeUser = users.find(u => u.id === userId)
                                      if (likeUser) {
                                        return (
                                          <div key={userId} className="flex items-center mb-2">
                                            <Avatar className="w-6 h-6 mr-2">
                                              <AvatarImage src={likeUser.avatar} alt={likeUser.name} />
                                              <AvatarFallback>{likeUser.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span>{likeUser.name}</span>
                                          </div>
                                        )
                                      }
                                      return null
                                    })}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCardDelete(card.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {isSidebarOpen && (
              <div className="w-[300px] overflow-auto pl-1 pr-4">
                <h3 className="text-lg font-bold mb-2 font-heading">Action Items</h3>
                <div className="mb-4">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Popover open={openAssignee} onOpenChange={setOpenAssignee}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openAssignee}
                        className="w-full justify-between"
                      >
                        {newActionItem.assignee
                          ? `${users.find((user) => user.id === newActionItem.assignee)?.name} (${newActionItem.assignee})`
                          : "Select assignee..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search assignee..." />
                        <CommandList>
                          <CommandEmpty>No assignee found.</CommandEmpty>
                          <CommandGroup>
                            {users.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={`${user.name} ${user.id}`.toLowerCase()}
                                onSelect={() => {
                                  setNewActionItem({ ...newActionItem, assignee: user.id })
                                  setOpenAssignee(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    newActionItem.assignee === user.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {user.name} ({user.id})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Label htmlFor="dueDate" className="mt-2">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="dueDate" variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newActionItem.dueDate ? format(new Date(newActionItem.dueDate), "yyyy/MM/dd") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newActionItem.dueDate ? new Date(newActionItem.dueDate) : undefined}
                        onSelect={(date: Date | undefined) => setNewActionItem({ ...newActionItem, dueDate: date?.toISOString() || '' })}
                        disabled={(date) => isBefore(date, startOfDay(new Date()))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Label htmlFor="actionContent" className="mt-2">Action Item</Label>
                  <Textarea
                    id="actionContent"
                    placeholder="Action item content (Enter to submit, Shift + Enter for new line)"
                    value={newActionItem.content}
                    onChange={(e) => setNewActionItem({ ...newActionItem, content: e.target.value })}
                    onKeyDown={handleActionItemKeyPress}
                    className="mt-2"
                  />
                  <Button 
                    className="w-full mt-2" 
                    onClick={handleActionItemSubmit} 
                    disabled={!isActionItemSubmitEnabled}
                  >
                    {editingActionItem ? "Update" : "Add"} Action Item
                  </Button>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span>Total: <Badge variant="secondary">{totalActionItems}</Badge></span>
                    <span>Overdue: <Badge variant="destructive">{overdueTasks}</Badge></span>
                  </div>
                </div>
                <div>
                  {actionItems.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`mb-2 ${
                        new Date(item.dueDate) < startOfDay(new Date()) 
                          ? "bg-destructive/10" 
                          : "bg-yellow-100"
                      }`}
                    >
                      <CardContent className="p-4">
                        <p className="whitespace-pre-wrap break-words">{item.content}</p>
                      </CardContent>
                      <div className="h-[40px] flex justify-between items-center px-4">
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <span className="text-xs text-muted-foreground truncate">
                            {users.find(user => user.id === item.assignee)?.name || 'Unassigned'}
                          </span>
                          <span className="text-xs text-muted-foreground">|</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {item.dueDate ? format(new Date(item.dueDate), "yyyy/MM/dd") : 'No due date'}
                          </span>
                        </div>
                        <div className="flex">
                          <Button variant="ghost" size="icon" onClick={() => handleActionItemEdit(item)}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleActionItemDelete(item.id)}>
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="h-4"></div>
        </div>
      )}
    </div>
  )
}