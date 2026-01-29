"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  BarChart3,
  Database,
  Home,
  Lock,
  TrendingUp,
  Users,
  Code,
  Grid3X3,
  ChevronRight,
  Search,
  Command,
  DoorOpen,
  Sun,
  Moon,
  Computer,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const navigation = [
  {
    title: "GET STARTED",
    items: [
      {
        title: "Overview",
        url: "/",
        icon: Home,
        isActive: true,
      },
    ],
  },
  {
    title: "CORE FEATURES",
    items: [
      {
        title: "Initialization",
        url: "/auth",
        icon: Lock,
      },
      {
        title: "Portal",
        url: "/portal",
        icon: DoorOpen,
      },
      {
        title: "Method Lab",
        url: "/methods",
        icon: Grid3X3,
      },
    ],
  },
  {
    title: "TRADING",
    items: [
      {
        title: "Trading",
        url: "/trading",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "DEVELOPER TOOLS",
    items: [
      {
        title: "Advanced Developer",
        url: "/developer",
        icon: Code,
      },
    ],
  },
]

interface AppSidebarProps extends React.ComponentProps<"div"> {}

export function AppSidebar({ className, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = React.useCallback(() => {
    const current = theme ?? "system"
    const next = current === "system" ? "light" : current === "light" ? "dark" : "system"
    setTheme(next)
  }, [setTheme, theme])

  const ThemeIcon = !mounted
    ? Computer
    : theme === "light"
      ? Sun
      : theme === "dark"
        ? Moon
        : Computer

  return (
    <div
      className={cn(
        "flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Command className="h-4 w-4" />
          </div>
          <span className="font-semibold">Finatic Demo App</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link key={item.url} href={item.url}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 text-left font-normal hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        pathname === item.url && "bg-sidebar-accent text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                      {pathname === item.url && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Theme */}
      <div className="border-t border-sidebar-border p-4">
        <button
          type="button"
          onClick={cycleTheme}
          aria-label="Toggle theme"
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ThemeIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
