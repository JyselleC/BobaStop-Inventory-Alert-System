"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Activity, RefreshCw } from "lucide-react"
import { getActivityLogs, isSupabaseConfigured } from "@/lib/supabase"

interface ActivityLog {
  id: number
  user_name: string
  action: string
  details: string
  timestamp: string
  created_at?: string
}

interface SimpleActivityLogsProps {
  userRole: string
  userName: string
}

export function SimpleActivityLogs({ userRole, userName }: SimpleActivityLogsProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("7days")
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<"supabase" | "local">("local")

  useEffect(() => {
    loadActivityLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchTerm, actionFilter, dateFilter])

  const loadActivityLogs = async () => {
    setLoading(true)
    let allLogs: ActivityLog[] = []

    // Try to load from Supabase first
    if (isSupabaseConfigured) {
      try {
        console.log("🔄 Loading activity logs from Supabase...")
        const supabaseLogs = await getActivityLogs()
        if (supabaseLogs && supabaseLogs.length > 0) {
          console.log(`✅ Loaded ${supabaseLogs.length} logs from Supabase`)
          allLogs = supabaseLogs
          setDataSource("supabase")
        } else {
          console.log("⚠️ No logs found in Supabase, checking localStorage...")
        }
      } catch (error) {
        console.error("❌ Error loading from Supabase:", error)
      }
    }

    // Fallback to localStorage if Supabase is empty or failed
    if (allLogs.length === 0) {
      try {
        const localLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
        console.log(`📱 Loaded ${localLogs.length} logs from localStorage`)
        allLogs = localLogs
        setDataSource("local")
      } catch (error) {
        console.error("❌ Error loading from localStorage:", error)
        allLogs = []
      }
    }

    console.log(`📊 Total logs loaded: ${allLogs.length}`)
    console.log("📅 Date range:", {
      oldest:
        allLogs.length > 0
          ? new Date(Math.min(...allLogs.map((log) => new Date(log.timestamp).getTime()))).toLocaleDateString()
          : "N/A",
      newest:
        allLogs.length > 0
          ? new Date(Math.max(...allLogs.map((log) => new Date(log.timestamp).getTime()))).toLocaleDateString()
          : "N/A",
    })

    setLogs(allLogs)
    setLoading(false)
  }

  const filterLogs = () => {
    let filtered = [...logs]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "1day":
          filterDate.setDate(now.getDate() - 1)
          break
        case "7days":
          filterDate.setDate(now.getDate() - 7)
          break
        case "30days":
          filterDate.setDate(now.getDate() - 30)
          break
        case "90days":
          filterDate.setDate(now.getDate() - 90)
          break
        default:
          filterDate.setFullYear(2000) // Show all
      }

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp)
        return logDate >= filterDate
      })
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    console.log(`🔍 Filtered logs: ${filtered.length} of ${logs.length} total`)
    setFilteredLogs(filtered)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "bg-green-100 text-green-800"
      case "LOGOUT":
        return "bg-gray-100 text-gray-800"
      case "CREATE":
        return "bg-blue-100 text-blue-800"
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      case "VIEW":
        return "bg-purple-100 text-purple-800"
      case "AUTO_ALERT":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const exportLogs = () => {
    const csvContent = [
      "Timestamp,User,Action,Details",
      ...filteredLogs.map((log) => `"${log.timestamp}","${log.user_name}","${log.action}","${log.details}"`),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `boba-stop-activity-logs-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearLogs = () => {
    if (userRole === "admin") {
      if (confirm("Are you sure you want to clear ALL activity logs? This cannot be undone.")) {
        localStorage.removeItem("activityLogs")
        setLogs([])
        alert("All activity logs have been cleared.")
      }
    }
  }

  const uniqueActions = [...new Set(logs.map((log) => log.action))]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading activity logs...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Logs
            </CardTitle>
            <CardDescription>
              System-wide activity log - showing {logs.length} total activities
              {dataSource === "supabase" ? " (from Supabase)" : " (from local storage)"}
            </CardDescription>
          </div>
          <Button
            onClick={loadActivityLogs}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Debug Info */}
        {logs.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <strong>Total Logs:</strong> {logs.length}
              </div>
              <div>
                <strong>Data Source:</strong> {dataSource === "supabase" ? "Supabase DB" : "Local Storage"}
              </div>
              <div>
                <strong>Date Range:</strong> {dateFilter}
              </div>
              <div>
                <strong>Showing:</strong> {filteredLogs.length} filtered
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1day">Last 24h</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button onClick={exportLogs} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export
            </Button>
            {userRole === "admin" && (
              <Button onClick={clearLogs} variant="outline" className="text-red-600 bg-transparent">
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    {logs.length === 0 ? "No activity logs found" : "No logs match your current filters"}
                    {logs.length === 0 && (
                      <div className="mt-2 text-sm">
                        Try performing some actions (login, update inventory, etc.) to generate activity logs
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.timestamp).toLocaleString("en-CA", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.user_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm">{log.details}</div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredLogs.length} of {logs.length} total activities
          {dataSource === "local" && logs.length > 0 && (
            <span className="ml-2 text-amber-600">• Data from local storage (Supabase sync may be needed)</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}