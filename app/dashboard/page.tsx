"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles, Search, Camera, Clock, BookOpen, User,
  TrendingUp, ShieldCheck, AlertTriangle, XCircle,
  Package, ChevronRight, ArrowUpRight, Scan, Trash2,
  LogIn, RefreshCw, LogOut, ChevronDown, CheckCircle2, X
} from "lucide-react"
import {
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import {
  type ScanHistoryItem,
  getLocalScanHistory, setLocalScanHistory, removeLocalScan,
  clearLocalScanHistory, fetchUserScans, deleteScanFromSupabase,
  deleteAllUserScans
} from "@/lib/supabase/scans"

/* ─── Helpers ─── */
function getScoreColor(score: number) {
  if (score >= 70) return "text-emerald-600 bg-emerald-50"
  if (score >= 40) return "text-amber-600 bg-amber-50"
  return "text-red-600 bg-red-50"
}

function getScoreDot(score: number) {
  if (score >= 70) return "bg-emerald-500"
  if (score >= 40) return "bg-amber-500"
  return "bg-red-500"
}

const riskConfig = {
  safe: { label: "SAFE", bgColor: "bg-emerald-50", textColor: "text-emerald-700", borderColor: "border-emerald-200", icon: ShieldCheck, dotColor: "bg-emerald-500" },
  moderate: { label: "MODERATE", bgColor: "bg-amber-50", textColor: "text-amber-700", borderColor: "border-amber-200", icon: AlertTriangle, dotColor: "bg-amber-500" },
  high: { label: "HIGH RISK", bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200", icon: XCircle, dotColor: "bg-red-500" },
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
}

const CATEGORY_COLORS: Record<string, string> = {
  "Instant Food": "#f59e0b",
  "Snacks": "#f97316",
  "Dairy": "#3b82f6",
  "Beverage": "#10b981",
  "Health Food": "#8b5cf6",
  "Cooking Oil": "#eab308",
  "Spices": "#ef4444",
  "Baby Food": "#ec4899",
  "Confectionery": "#f472b6",
  "Bakery": "#d97706",
  "Cereal": "#84cc16",
  "Frozen Food": "#06b6d4",
  "Food": "#6366f1",
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || "#6b7280"
}

/* ─── Dashboard Page ─── */
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selectedScan, setSelectedScan] = useState<ScanHistoryItem | null>(null)
  const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null)

  const { user, loading: authLoading, signOut } = useAuth()
  const supabase = createClient()

  // Fetch from Supabase into localStorage, then render from localStorage
  const syncFromSupabase = useCallback(async () => {
    if (!user) return

    setSyncing(true)
    try {
      const { items, error } = await fetchUserScans(supabase, user.id)

      if (error) {
        setSyncing(false)
        return
      }

      setLocalScanHistory(items)
      setScanHistory(items)
      localStorage.setItem("scanHistory_synced", Date.now().toString())
    } catch (err) {
      console.error("Sync error:", err)
    }
    setSyncing(false)
  }, [user, supabase])

  // On mount: load from localStorage first for instant render, then sync
  useEffect(() => {
    setMounted(true)
    setScanHistory(getLocalScanHistory())
  }, [])

  // When auth resolves and user is logged in, sync from Supabase
  useEffect(() => {
    if (authLoading || !user) return

    // Check if we already synced recently (within 30s)
    const lastSync = localStorage.getItem("scanHistory_synced")
    const now = Date.now()
    if (lastSync && now - parseInt(lastSync) < 30000) {
      return
    }

    syncFromSupabase()
  }, [authLoading, user, syncFromSupabase])

  const filteredHistory = useMemo(() =>
    scanHistory.filter(item =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())
    ), [scanHistory, searchQuery]
  )

  // Compute stats dynamically
  const stats = useMemo(() => {
    const total = scanHistory.length
    const safe = scanHistory.filter(s => s.safetyScore >= 70).length
    const flagged = scanHistory.filter(s => s.safetyScore < 40).length
    const avg = total > 0 ? Math.round(scanHistory.reduce((sum, s) => sum + s.safetyScore, 0) / total) : 0

    return [
      { label: "Total Scans", value: String(total), icon: Scan, trend: total > 0 ? `${total} product${total > 1 ? "s" : ""} analyzed` : "No scans yet", color: "bg-zinc-900 text-white" },
      { label: "Safe Products", value: String(safe), icon: ShieldCheck, trend: total > 0 ? `${Math.round((safe / total) * 100)}% of scans` : "—", color: "bg-emerald-50 text-emerald-700" },
      { label: "Flagged Items", value: String(flagged), icon: AlertTriangle, trend: flagged > 0 ? "Needs attention" : "All clear", color: "bg-amber-50 text-amber-700" },
      { label: "Avg Score", value: String(avg), icon: TrendingUp, trend: total > 0 ? "Out of 100" : "—", color: "bg-blue-50 text-blue-700" },
    ]
  }, [scanHistory])

  // Compute category breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    scanHistory.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value: Math.round((value / scanHistory.length) * 100),
      color: getCategoryColor(name),
    }))
  }, [scanHistory])

  // Compute alerts from risky items
  const alerts = useMemo(() => {
    return scanHistory
      .filter(s => s.safetyScore < 55)
      .slice(0, 5)
      .map(s => {
        const riskyIngredient = s.ingredients.find(i => i.risk === "high")
        return {
          product: s.productName,
          concern: riskyIngredient
            ? `${riskyIngredient.name} — ${riskyIngredient.detail.slice(0, 60)}...`
            : `Safety score: ${s.safetyScore}/100`,
          score: s.safetyScore,
          icon: s.safetyScore < 40 ? XCircle : AlertTriangle,
        }
      })
  }, [scanHistory])

  const handleDeleteScan = useCallback(async (scanId: string) => {
    // Remove from local state + localStorage
    const updated = removeLocalScan(scanId)
    setScanHistory(updated)

    // Remove from Supabase if logged in
    if (user) {
      await deleteScanFromSupabase(supabase, scanId)
    }
  }, [user, supabase])

  const handleClearHistory = async () => {
    clearLocalScanHistory()
    setScanHistory([])

    // Also delete from Supabase if logged in
    if (user) {
      await deleteAllUserScans(supabase, user.id)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 md:pb-8">
      {/* ─── Top Header ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 min-h-[44px]">
            <Sparkles className="w-5 h-5 text-zinc-900" />
            <span className="text-base font-semibold text-zinc-900 sm:inline">ReadTheLabel</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 md:w-64 pl-9 pr-4 py-2 text-sm bg-zinc-100 rounded-xl border-0 outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
              />
            </div>
            {user ? (
              <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-white">
                    {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
            ) : (
              <Link href="/login" className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors">
                <User className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-100 rounded-xl border-0 outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ─── Welcome + Quick Actions ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {user ? `Welcome back, ${user.user_metadata?.full_name?.split(" ")[0] || "User"}` : "Your product safety overview"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors min-h-[44px]"
            >
              <Camera className="w-4 h-4" />
              New Scan
            </Link>
            {user && (
              <button
                onClick={syncFromSupabase}
                disabled={syncing}
                className="inline-flex items-center gap-2 bg-white text-zinc-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors min-h-[44px] disabled:opacity-50"
                title="Sync from cloud"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* ─── Login Banner for unauthenticated users ─── */}
        {!authLoading && !user && scanHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <LogIn className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900">Sign in to sync your scans</p>
              <p className="text-xs text-zinc-500 mt-0.5">Your scans are stored locally. Sign in to back them up to the cloud.</p>
            </div>
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex-shrink-0"
            >
              Sign in
            </Link>
          </motion.div>
        )}

        {/* ─── Empty State ─── */}
        {scanHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
              <Scan className="w-12 h-12 text-zinc-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-2">No scans yet</h2>
            <p className="text-sm text-zinc-500 max-w-sm mb-8 leading-relaxed">
              Start scanning food product labels to see your safety analysis history and insights here.
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors min-h-[44px]"
            >
              <Camera className="w-4 h-4" />
              Scan Your First Product
            </Link>
          </motion.div>
        ) : (
          <>
            {/* ─── Stats Cards ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-2xl p-4 sm:p-5 ${index === 0 ? stat.color : "bg-white border border-zinc-100"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${index === 0 ? "bg-white/20" : stat.color}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      {index === 0 && <ArrowUpRight className="w-4 h-4 text-white/60" />}
                    </div>
                    <p className={`text-2xl sm:text-3xl font-bold ${index === 0 ? "" : "text-zinc-900"}`}>{stat.value}</p>
                    <p className={`text-xs mt-1 ${index === 0 ? "text-white/70" : "text-zinc-500"}`}>{stat.label}</p>
                    <p className={`text-[10px] mt-0.5 ${index === 0 ? "text-white/50" : "text-zinc-400"}`}>{stat.trend}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* ─── Mobile Tab Toggle ─── */}
            <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl mb-6 md:hidden">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${activeTab === "overview" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${activeTab === "history" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}
              >
                History
              </button>
            </div>

            {/* ─── Main Content Grid ─── */}
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left Column - Scan History */}
              <div className={`lg:col-span-2 ${activeTab !== "history" ? "hidden md:block" : ""}`}>
                <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-zinc-900">Recent Scans</h2>
                    <span className="text-xs text-zinc-400">{filteredHistory.length} product{filteredHistory.length !== 1 ? "s" : ""}</span>
                  </div>

                  <div className="divide-y divide-zinc-50">
                    {filteredHistory.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                        onClick={() => { setSelectedScan(item); setExpandedIngredient(null) }}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getScoreColor(item.safetyScore)}`}>
                          <span className="text-sm font-bold">{item.safetyScore}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">{item.productName}</p>
                          <p className="text-xs text-zinc-400">{item.brand} · {item.category}</p>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                          <div>
                            <p className="text-xs text-zinc-400">{formatDate(item.scannedAt)}</p>
                            <div className="flex items-center gap-1 justify-end mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${getScoreDot(item.safetyScore)}`} />
                              <span className="text-[10px] text-zinc-400">{item.safetyScore >= 70 ? "Safe" : item.safetyScore >= 40 ? "Moderate" : "Risk"}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteScan(item.id) }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete scan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors hidden sm:block" />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {filteredHistory.length === 0 && scanHistory.length > 0 && (
                    <div className="px-5 py-12 text-center">
                      <Package className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-sm text-zinc-400">No products match your search</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Charts & Alerts */}
              <div className={`space-y-4 sm:space-y-6 ${activeTab !== "overview" ? "hidden md:block" : ""}`}>
                {/* Category Breakdown */}
                {categoryData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl border border-zinc-100 p-5"
                  >
                    <h3 className="text-base font-semibold text-zinc-900 mb-4">Categories</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-2">
                      {categoryData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-zinc-600">{item.name}</span>
                          </div>
                          <span className="text-xs font-medium text-zinc-900">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recent Alerts */}
                {alerts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl border border-zinc-100 p-5"
                  >
                    <h3 className="text-base font-semibold text-zinc-900 mb-4">Recent Alerts</h3>
                    <div className="space-y-3">
                      {alerts.map((alert, index) => {
                        const Icon = alert.icon
                        return (
                          <div key={index} className="flex gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100/50">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-900 truncate">{alert.product}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">{alert.concern}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ─── Scan Detail Modal ─── */}
        <AnimatePresence>
          {selectedScan && (
            <motion.div
              key="scan-detail-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
              onClick={() => setSelectedScan(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-zinc-900">Scan Details</h2>
                  <button
                    onClick={() => setSelectedScan(null)}
                    className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Product Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#f4f4f5" strokeWidth="6" />
                        <circle
                          cx="60" cy="60" r="54" fill="none"
                          stroke={selectedScan.safetyScore >= 70 ? "#10b981" : selectedScan.safetyScore >= 40 ? "#f59e0b" : "#ef4444"}
                          strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 54}
                          strokeDashoffset={2 * Math.PI * 54 * (1 - selectedScan.safetyScore / 100)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-zinc-900">{selectedScan.safetyScore}</span>
                        <span className="text-[9px] text-zinc-400">/ 100</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="text-lg font-semibold text-zinc-900">{selectedScan.productName}</h3>
                      <p className="text-sm text-zinc-500">{selectedScan.brand} · {selectedScan.category}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedScan.fssaiCompliant && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> FSSAI
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${selectedScan.safetyScore >= 70 ? "bg-emerald-50 text-emerald-700" : selectedScan.safetyScore >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                          {selectedScan.safetyScore >= 70 ? "Low Risk" : selectedScan.safetyScore >= 40 ? "Moderate Risk" : "High Risk"}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-2">{formatDate(selectedScan.scannedAt)}</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total", value: selectedScan.ingredients.length, color: "text-zinc-900" },
                      { label: "Safe", value: selectedScan.ingredients.filter(i => i.risk === "safe").length, color: "text-emerald-600" },
                      { label: "Risky", value: selectedScan.ingredients.filter(i => i.risk === "high").length, color: "text-red-600" },
                    ].map((stat, index) => (
                      <div key={index} className="bg-zinc-50 rounded-xl p-3 text-center">
                        <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Ingredient Breakdown */}
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 mb-3">Ingredient Breakdown</h4>
                    <div className="space-y-2">
                      {selectedScan.ingredients.map((ingredient, index) => {
                        const config = riskConfig[ingredient.risk]
                        const RiskIcon = config.icon
                        const isExpanded = expandedIngredient === index
                        return (
                          <div key={index}>
                            <button
                              onClick={() => setExpandedIngredient(isExpanded ? null : index)}
                              className={`w-full text-left rounded-xl p-3 transition-all ${isExpanded ? `${config.bgColor} ${config.borderColor} border` : "bg-zinc-50 hover:bg-zinc-100 border border-transparent"}`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dotColor}`} />
                                  <span className="text-sm text-zinc-800 truncate">{ingredient.name}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}>
                                    {config.label}
                                  </span>
                                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </div>
                              </div>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-3 pt-3 border-t border-zinc-200/50 space-y-2">
                                      <p className="text-sm text-zinc-600 leading-relaxed">{ingredient.detail}</p>
                                      <div className={`flex items-start gap-2 p-2 rounded-lg ${config.bgColor}`}>
                                        <RiskIcon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${config.textColor}`} />
                                        <p className={`text-xs ${config.textColor}`}>{ingredient.regulation}</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {selectedScan.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {selectedScan.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-zinc-600 leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <p className="text-[10px] text-zinc-400 text-center">{selectedScan.disclaimer}</p>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pb-2">
                    <button
                      onClick={() => setSelectedScan(null)}
                      className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-700 py-3 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors min-h-[44px]"
                    >
                      <X className="w-4 h-4" />
                      Close
                    </button>
                    <Link
                      href="/scan"
                      className="flex items-center justify-center gap-2 bg-zinc-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors min-h-[44px]"
                    >
                      <Scan className="w-4 h-4" />
                      New Scan
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-zinc-100 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-4">
          {[
            { icon: Scan, label: "Scan", href: "/scan", active: false },
            { icon: BookOpen, label: "Learn", href: "/learn", active: false },
            { icon: Clock, label: "History", href: "/dashboard", active: true },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors min-h-[44px] min-w-[44px] justify-center ${item.active
                  ? "text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
          {user && (
            <button
              onClick={signOut}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors min-h-[44px] min-w-[44px] justify-center text-zinc-400 hover:text-red-500"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-medium">Logout</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}
