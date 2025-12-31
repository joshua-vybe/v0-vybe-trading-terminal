"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type UserRole = "PlatformAdmin" | "TenantAdmin" | "Trader" | "Viewer" | "ApiUser"

export type Permission =
  | "ViewAllUsers"
  | "ViewAllTrades"
  | "ViewAllStrategies"
  | "ExportUserData"
  | "ViewAuditLogs"
  | "ManageUsers"
  | "ViewSystemMetrics"

interface AdminContextType {
  role: UserRole
  permissions: Permission[]
  hasPermission: (permission: Permission) => boolean
  setRole: (role: UserRole) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const rolePermissions: Record<UserRole, Permission[]> = {
  PlatformAdmin: [
    "ViewAllUsers",
    "ViewAllTrades",
    "ViewAllStrategies",
    "ExportUserData",
    "ViewAuditLogs",
    "ManageUsers",
    "ViewSystemMetrics",
  ],
  TenantAdmin: ["ViewAllUsers", "ViewAllTrades", "ViewAllStrategies", "ManageUsers"],
  Trader: [],
  Viewer: [],
  ApiUser: [],
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("PlatformAdmin")

  const hasPermission = (permission: Permission): boolean => {
    return rolePermissions[role].includes(permission)
  }

  return (
    <AdminContext.Provider
      value={{
        role,
        permissions: rolePermissions[role],
        hasPermission,
        setRole,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider")
  }
  return context
}
