"use client"

import { useState } from "react"

type ExportType = "users" | "trades" | "strategies" | "positions" | "ai_requests" | "platform_metrics"
type ExportFormat = "csv" | "json" | "parquet"

interface ExportJob {
  id: string
  type: ExportType
  format: ExportFormat
  status: "preparing" | "ready" | "downloading" | "completed"
  createdAt: string
  recordCount: number
  fileSize: string
}

const mockExportJobs: ExportJob[] = [
  {
    id: "export_123",
    type: "trades",
    format: "csv",
    status: "ready",
    createdAt: "2024-12-11 10:24:00",
    recordCount: 142_847,
    fileSize: "24.8 MB",
  },
  {
    id: "export_124",
    type: "users",
    format: "json",
    status: "completed",
    createdAt: "2024-12-10 14:15:00",
    recordCount: 1_247,
    fileSize: "1.2 MB",
  },
]

export function DataExportDashboard() {
  const [exportType, setExportType] = useState<ExportType>("users")
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv")
  const [anonymize, setAnonymize] = useState(true)
  const [dateRange, setDateRange] = useState({ start: "2024-12-01", end: "2024-12-11" })

  const handleCreateExport = () => {
    console.log("[v0] Creating export:", { exportType, exportFormat, anonymize, dateRange })
    alert(`Creating ${exportType} export in ${exportFormat} format...`)
  }

  return (
    <div className="flex gap-2 h-full p-2">
      {/* Export Configuration */}
      <div className="w-1/2 flex flex-col gap-2">
        <div className="neon-border glass-panel p-3">
          <h3 className="text-sm font-bold glow-cyan mb-3">CREATE NEW EXPORT</h3>

          <div className="space-y-3">
            {/* Export Type */}
            <div>
              <label className="text-[10px] text-[#ffffff60] mb-2 block">DATA TYPE</label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  ["users", "trades", "strategies", "positions", "ai_requests", "platform_metrics"] as ExportType[]
                ).map((type) => (
                  <button
                    key={type}
                    onClick={() => setExportType(type)}
                    className={`
                        px-3 py-2 text-[10px] font-bold border transition-all
                        ${
                          exportType === type
                            ? "border-[#00ffff] bg-[#00ffff15] text-[#00ffff]"
                            : "border-[#ffffff20] text-[#ffffff60] hover:border-[#ffffff40]"
                        }
                      `}
                  >
                    {type.replace("_", " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="text-[10px] text-[#ffffff60] mb-2 block">FORMAT</label>
              <div className="flex gap-2">
                {(["csv", "json", "parquet"] as ExportFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => setExportFormat(format)}
                    className={`
                      flex-1 px-3 py-2 text-[10px] font-bold border transition-all
                      ${
                        exportFormat === format
                          ? "border-[#00ffff] bg-[#00ffff15] text-[#00ffff]"
                          : "border-[#ffffff20] text-[#ffffff60] hover:border-[#ffffff40]"
                      }
                    `}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-[10px] text-[#ffffff60] mb-2 block">DATE RANGE</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="bg-[#00000040] border border-[#00ffff40] px-2 py-2 text-[10px] text-white focus:outline-none focus:border-[#00ffff]"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="bg-[#00000040] border border-[#00ffff40] px-2 py-2 text-[10px] text-white focus:outline-none focus:border-[#00ffff]"
                />
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="flex items-center gap-2 text-[10px] text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymize}
                  onChange={(e) => setAnonymize(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Anonymize data (remove PII for analytics firms)</span>
              </label>
            </div>

            <button
              onClick={handleCreateExport}
              className="w-full px-4 py-3 text-[11px] font-bold border border-[#00ffff] bg-[#00ffff15] text-[#00ffff] hover:bg-[#00ffff25] transition-colors"
            >
              CREATE EXPORT
            </button>
          </div>
        </div>

        <div className="neon-border glass-panel p-3">
          <h3 className="text-sm font-bold text-yellow-400 mb-2">⚠ EXPORT GUIDELINES</h3>
          <ul className="text-[9px] text-[#ffffff80] space-y-1">
            <li>• Large exports may take several minutes to prepare</li>
            <li>• Anonymized data is suitable for sharing with analytics firms</li>
            <li>• All exports are logged in the audit trail</li>
            <li>• Exports expire after 7 days</li>
          </ul>
        </div>
      </div>

      {/* Export History */}
      <div className="w-1/2 flex flex-col gap-2">
        <div className="neon-border glass-panel p-3 flex-1">
          <h3 className="text-sm font-bold glow-cyan mb-3">EXPORT HISTORY</h3>
          <div className="space-y-2">
            {mockExportJobs.map((job) => (
              <div key={job.id} className="border border-[#ffffff20] p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[11px] text-white font-bold">{job.type.replace("_", " ").toUpperCase()}</div>
                    <div className="text-[9px] text-[#ffffff60]">{job.format.toUpperCase()}</div>
                  </div>
                  <span
                    className={`
                      px-2 py-0.5 text-[9px] font-bold rounded
                      ${job.status === "ready" ? "bg-green-500/20 text-green-400" : ""}
                      ${job.status === "preparing" ? "bg-yellow-500/20 text-yellow-400" : ""}
                      ${job.status === "completed" ? "bg-blue-500/20 text-blue-400" : ""}
                    `}
                  >
                    {job.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[9px] text-[#ffffff80] space-y-1">
                  <div>Records: {job.recordCount.toLocaleString()}</div>
                  <div>Size: {job.fileSize}</div>
                  <div>Created: {job.createdAt}</div>
                </div>
                {job.status === "ready" && (
                  <button className="w-full mt-2 px-3 py-2 text-[10px] font-bold border border-[#00ffff40] text-[#00ffff] hover:bg-[#00ffff15] transition-colors">
                    DOWNLOAD
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
