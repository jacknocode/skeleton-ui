"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  collapsible: "none" | "always" | "mobile" | "desktop"
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

function useSidebarContext() {
  const context = React.useContext(SidebarContext)

  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider")
  }

  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
  collapsible?: "none" | "always" | "mobile" | "desktop"
}

function SidebarProvider({ children, defaultCollapsed = false, collapsible = "always" }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        collapsible,
      }}
    >
      <div className="grid lg:grid-cols-[auto_1fr] xl:grid-cols-[auto_1fr_auto]">{children}</div>
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean
  collapsible?: "none" | "always" | "mobile" | "desktop"
}

function Sidebar({ className, defaultCollapsed, collapsible = "always", ...props }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed ?? false)

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        collapsible,
      }}
    >
      <div
        data-collapsed={collapsed}
        className={cn(
          "relative flex h-full flex-col gap-4 border-r bg-background",
          collapsed ? "w-16" : "w-64",
          className,
        )}
        {...props}
      />
    </SidebarContext.Provider>
  )
}

function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4", className)} {...props} />
}

function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-1 flex-col gap-4 overflow-hidden", className)} {...props} />
}

function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4", className)} {...props} />
}

function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />
}

function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebarContext()

  return (
    <div
      className={cn(
        "flex h-6 items-center px-4 text-xs font-medium text-muted-foreground",
        collapsed && "justify-center",
        className,
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />
}

function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex flex-col gap-1", className)} {...props} />
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  isActive?: boolean
}

function SidebarMenuItem({ className, isActive, ...props }: SidebarMenuItemProps) {
  return <li className={cn("flex flex-col gap-1", isActive && "bg-muted/50", className)} {...props} />
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
}

function SidebarMenuButton({ className, isActive, ...props }: SidebarMenuButtonProps) {
  const { collapsed } = useSidebarContext()

  return (
    <button
      type="button"
      className={cn(
        "flex h-9 w-full items-center gap-2 rounded-md px-4 text-sm font-medium ring-offset-background transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-muted/50",
        collapsed && "justify-center",
        className,
      )}
      data-active={isActive}
      {...props}
    />
  )
}

function SidebarMenuSub({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  const { collapsed } = useSidebarContext()

  return <ul className={cn("flex flex-col gap-1 pl-4", collapsed && "items-center pl-0", className)} {...props} />
}

function SidebarMenuBadge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebarContext()

  return (
    <div
      className={cn(
        "ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium",
        collapsed && "ml-0",
        className,
      )}
      {...props}
    />
  )
}

function SidebarSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-4 h-[1px] bg-border", className)} role="separator" {...props} />
}

function SidebarRail({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed, setCollapsed, collapsible } = useSidebarContext()

  if (collapsible === "none") {
    return null
  }

  if (collapsible === "mobile") {
    return (
      <div
        className={cn("absolute right-0 top-0 h-full w-[1px] translate-x-[1px] bg-border lg:hidden", className)}
        {...props}
      />
    )
  }

  if (collapsible === "desktop") {
    return (
      <div
        className={cn("absolute right-0 top-0 hidden h-full w-[1px] translate-x-[1px] bg-border lg:block", className)}
        {...props}
      />
    )
  }

  return (
    <div className={cn("absolute right-0 top-0 h-full w-[1px] translate-x-[1px] bg-border", className)} {...props} />
  )
}

function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { collapsed, setCollapsed, collapsible } = useSidebarContext()

  if (collapsible === "none") {
    return null
  }

  if (collapsible === "mobile") {
    return (
      <button
        type="button"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md border bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 lg:hidden",
          className,
        )}
        onClick={() => setCollapsed((prev) => !prev)}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <line x1="9" x2="15" y1="3" y2="3" />
          <line x1="3" x2="3" y1="9" y2="15" />
          <line x1="9" x2="15" y1="21" y2="21" />
          <line x1="21" x2="21" y1="9" y2="15" />
        </svg>
        <span className="sr-only">Toggle Sidebar</span>
      </button>
    )
  }

  if (collapsible === "desktop") {
    return (
      <button
        type="button"
        className={cn(
          "hidden h-9 w-9 items-center justify-center rounded-md border bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 lg:flex",
          className,
        )}
        onClick={() => setCollapsed((prev) => !prev)}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <line x1="9" x2="15" y1="3" y2="3" />
          <line x1="3" x2="3" y1="9" y2="15" />
          <line x1="9" x2="15" y1="21" y2="21" />
          <line x1="21" x2="21" y1="9" y2="15" />
        </svg>
        <span className="sr-only">Toggle Sidebar</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={() => setCollapsed((prev) => !prev)}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <line x1="9" x2="15" y1="3" y2="3" />
        <line x1="3" x2="3" y1="9" y2="15" />
        <line x1="9" x2="15" y1="21" y2="21" />
        <line x1="21" x2="21" y1="9" y2="15" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col", className)} {...props} />
}

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuBadge,
  SidebarSeparator,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
  SidebarProvider,
}

