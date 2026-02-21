"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react"

const mockIngredients = [
  { name: "Whole Wheat Flour (Atta)", risk: "safe" as const, detail: "Natural grain flour, good source of fiber" },
  { name: "Palm Oil", risk: "moderate" as const, detail: "High in saturated fats, linked to heart disease risk" },
  { name: "Tartrazine (E102)", risk: "high" as const, detail: "Synthetic dye banned in several EU countries, linked to hyperactivity in children" },
  { name: "Sugar", risk: "moderate" as const, detail: "Excessive consumption linked to obesity and diabetes" },
  { name: "Salt (Iodized)", risk: "safe" as const, detail: "Essential mineral, within recommended daily limits" },
  { name: "Sodium Benzoate (E211)", risk: "high" as const, detail: "Preservative that may form benzene (carcinogen) when combined with Vitamin C" },
  { name: "Vitamin B12", risk: "safe" as const, detail: "Essential vitamin, beneficial for nervous system" },
]

const riskConfig = {
  safe: { label: "SAFE", color: "bg-emerald-100 text-emerald-700", icon: ShieldCheck, dotColor: "bg-emerald-500" },
  moderate: { label: "MODERATE", color: "bg-amber-100 text-amber-700", icon: AlertTriangle, dotColor: "bg-amber-500" },
  high: { label: "HIGH RISK", color: "bg-red-100 text-red-700", icon: XCircle, dotColor: "bg-red-500" },
}

export function RealtimePropertyCard() {
  const [safetyScore, setSafetyScore] = useState(0)
  const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null)
  const [visibleIngredients, setVisibleIngredients] = useState(0)
  const targetScore = 62
  const cardRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.3 },
    )

    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return
    const timer = setInterval(() => {
      setSafetyScore((prev) => {
        if (prev >= targetScore) {
          clearInterval(timer)
          return targetScore
        }
        return prev + 1
      })
    }, 30)
    return () => clearInterval(timer)
  }, [hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return
    const timer = setInterval(() => {
      setVisibleIngredients((prev) => {
        if (prev >= mockIngredients.length) {
          clearInterval(timer)
          return mockIngredients.length
        }
        return prev + 1
      })
    }, 200)
    return () => clearInterval(timer)
  }, [hasAnimated])

  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (safetyScore / 100) * circumference
  const scoreColor = safetyScore >= 70 ? "#10b981" : safetyScore >= 40 ? "#f59e0b" : "#ef4444"

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="w-full rounded-2xl bg-white p-4 sm:p-6 overflow-hidden"
      style={{
        boxShadow:
          "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px",
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">Maggi 2-Minute Noodles</h3>
          <p className="text-sm text-zinc-500">Instant Food / Nestle India</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Analyzed
        </span>
      </div>

      {/* Safety Score Circle */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f4f4f5" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={safetyScore}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-3xl font-bold text-zinc-900"
              >
                {safetyScore}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs text-zinc-500">/ 100</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-zinc-600">4 Safe ingredients</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-zinc-600">2 Moderate concern</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-zinc-600">2 High risk</span>
          </div>
        </div>
      </div>

      {/* Ingredient List */}
      <div>
        <p className="mb-3 text-sm font-medium text-zinc-700">Ingredient Breakdown</p>
        <div className="space-y-1.5">
          {mockIngredients.slice(0, visibleIngredients).map((ingredient, index) => {
            const config = riskConfig[ingredient.risk]
            const isExpanded = expandedIngredient === index
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => setExpandedIngredient(isExpanded ? null : index)}
                  className="w-full text-left rounded-lg bg-zinc-50 px-3 py-2.5 hover:bg-zinc-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700">{ingredient.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-xs text-zinc-500 mt-1.5 leading-relaxed overflow-hidden"
                      >
                        {ingredient.detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
