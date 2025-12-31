"use client"

import { useState } from "react"
import { UserManagementDashboard } from "./admin/user-management-dashboard"
import { AnalyticsDashboard } from "./admin/analytics-dashboard"
import { ComplianceDashboard } from "./admin/compliance-dashboard"
import { DataExportDashboard } from "./admin/data-export-dashboard"
import { useAdmin } from "@/contexts/admin-context"

export function AdminTab() {
  const [activeSubTab, setActiveSubTab] = useState<"users" | "analytics" | "compliance" | "export">("users")
  const { role, hasPermission } = useAdmin()

  const tabs = [
    { id: "users" as const, label: "USER MANAGEMENT", permission: "ViewAllUsers" as const },
    { id: "analytics" as const, label: "ANALYTICS", permission: "ViewSystemMetrics" as const },
    { id: "compliance" as const, label: "COMPLIANCE", permission: "ViewAuditLogs" as const },
    { id: "export" as const, label: "DATA EXPORT", permission: "ExportUserData" as const },
  ]

  return (
    <div className="flex flex-col h-full gap-2 p-2">
      {/* Admin Header */}
      <div className="neon-border glass-panel p-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold glow-cyan">PLATFORM ADMIN DASHBOARD</h2>
            <div className="text-[10px] text-[#ffffff60]">
              ROLE: <span className="text-fuchsia-400 font-bold">{role}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-green-400">●</span>
            <span className="text-[#ffffff60]">ADMIN ACCESS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            disabled={!hasPermission(tab.permission)}
            className={`
              px-4 py-2 text-[10px] font-bold border transition-all
              ${
                activeSubTab === tab.id
                  ? "border-[#00ffff] bg-[#00ffff15] text-[#00ffff]"
                  : hasPermission(tab.permission)
                    ? "border-[#ffffff20] text-[#ffffff60] hover:border-[#ffffff40]"
                    : "border-[#ffffff10] text-[#ffffff20] cursor-not-allowed"
              }
            `}
          >
            {tab.label}
            {!hasPermission(tab.permission) && <span className="ml-1 text-[8px] text-red-400">🔒</span>}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeSubTab === "users" && <UserManagementDashboard />}
        {activeSubTab === "analytics" && <AnalyticsDashboard />}
        {activeSubTab === "compliance" && <ComplianceDashboard />}
        {activeSubTab === "export" && <DataExportDashboard />}
      </div>
    </div>
  )
}
