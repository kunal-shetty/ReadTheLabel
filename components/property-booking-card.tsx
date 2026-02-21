"use client"

import { cn } from "@/lib/utils"
import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react"

export interface ProductScanCardProps {
  productName: string
  brand: string
  category: string
  safetyScore: number
  riskyIngredientCount: number
  totalIngredients: number
  topConcern?: string
  className?: string
}

function getScoreConfig(score: number) {
  if (score >= 70) return { label: "Safe", color: "bg-emerald-100 text-emerald-700", icon: ShieldCheck, ring: "ring-emerald-200" }
  if (score >= 40) return { label: "Moderate", color: "bg-amber-100 text-amber-700", icon: AlertTriangle, ring: "ring-amber-200" }
  return { label: "High Risk", color: "bg-red-100 text-red-700", icon: XCircle, ring: "ring-red-200" }
}

export function PropertyBookingCard({
  productName,
  brand,
  category,
  safetyScore,
  riskyIngredientCount,
  totalIngredients,
  topConcern,
  className,
}: ProductScanCardProps) {
  const config = getScoreConfig(safetyScore)
  const Icon = config.icon

  return (
    <div
      className={cn("w-full h-full flex flex-col overflow-hidden rounded-3xl bg-white", className)}
      style={{
        boxShadow:
          "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px",
      }}
    >
      {/* Top Section with Score */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{category}</span>
            <h3 className="text-xl font-semibold text-zinc-900 mt-1 text-balance">{productName}</h3>
            <p className="text-sm text-zinc-500">{brand}</p>
          </div>
          <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1", config.color, config.ring)}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </div>
        </div>

        {/* Score Bar */}
        <div className="mb-4">
          <div className="flex items-end justify-between mb-2">
            <span className="text-4xl font-bold text-zinc-900">{safetyScore}</span>
            <span className="text-sm text-zinc-400 mb-1">/ 100</span>
          </div>
          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${safetyScore}%`,
                backgroundColor: safetyScore >= 70 ? "#10b981" : safetyScore >= 40 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-zinc-50 p-3">
            <p className="text-2xl font-semibold text-zinc-900">{totalIngredients}</p>
            <p className="text-xs text-zinc-500">Total Ingredients</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3">
            <p className="text-2xl font-semibold" style={{ color: riskyIngredientCount > 2 ? "#ef4444" : riskyIngredientCount > 0 ? "#f59e0b" : "#10b981" }}>
              {riskyIngredientCount}
            </p>
            <p className="text-xs text-zinc-500">Concerning</p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      {topConcern && (
        <div className="px-6 pb-6 pt-2 mt-auto">
          <div className="rounded-xl bg-red-50 border border-red-100 p-3">
            <p className="text-xs font-medium text-red-700 mb-0.5">Top Concern</p>
            <p className="text-sm text-red-600">{topConcern}</p>
          </div>
        </div>
      )}
    </div>
  )
}
