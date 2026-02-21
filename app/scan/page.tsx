"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
    Camera, Upload, ArrowLeft, X, ChevronDown,
    ShieldCheck, AlertTriangle, XCircle, Scan, Image as ImageIcon,
    Sparkles, CheckCircle2, ExternalLink, Clock, BookOpen,
    Ban, LogOut
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import {
    type AnalysisResult, type Ingredient, type RiskLevel,
    saveLocalScan, saveScanToSupabase
} from "@/lib/supabase/scans"

/* ─── Types ─── */
type ScanState = "idle" | "scanning" | "result" | "not_food" | "error"

/* ─── Config ─── */
const riskConfig = {
    safe: { label: "SAFE", bgColor: "bg-emerald-50", textColor: "text-emerald-700", borderColor: "border-emerald-200", icon: ShieldCheck, dotColor: "bg-emerald-500" },
    moderate: { label: "MODERATE", bgColor: "bg-amber-50", textColor: "text-amber-700", borderColor: "border-amber-200", icon: AlertTriangle, dotColor: "bg-amber-500" },
    high: { label: "HIGH RISK", bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200", icon: XCircle, dotColor: "bg-red-500" },
}

const scanningSteps = [
    "Detecting label...",
    "Extracting text with OCR...",
    "Identifying ingredients...",
    "Cross-referencing FSSAI database...",
    "Checking WHO safety data...",
    "Analyzing risk levels...",
    "Generating safety report...",
]

/* ─── Scan Page ─── */
export default function ScanPage() {
    const [scanState, setScanState] = useState<ScanState>("idle")
    const [scanProgress, setScanProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null)
    const [animatedScore, setAnimatedScore] = useState(0)
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
    const [errorMessage, setErrorMessage] = useState("")
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const { user, signOut } = useAuth()
    const supabase = createClient()

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Show preview
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)

        // Start scanning UI
        setScanState("scanning")
        setScanProgress(0)
        setCurrentStep(0)
        setAnalysisResult(null)
        setErrorMessage("")

        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                setErrorMessage(data.error || "Failed to analyze the label. Please try again.")
                setScanState("error")
                return
            }

            if (data.type === "not_food") {
                setErrorMessage(data.error?.message || "Only food items are allowed. Please upload a food product label.")
                setScanState("not_food")
                return
            }

            if (data.type === "analysis" && data.analysis) {
                const result: AnalysisResult = {
                    productName: data.analysis.productName || "Unknown Product",
                    brand: data.analysis.brand || "Unknown Brand",
                    category: data.analysis.category || "Food",
                    safetyScore: data.analysis.safetyScore ?? 50,
                    fssaiCompliant: data.analysis.fssaiCompliant ?? false,
                    ingredients: (data.analysis.ingredients || []).map((ing: Ingredient) => ({
                        name: ing.name || "Unknown",
                        risk: (["safe", "moderate", "high"].includes(ing.risk) ? ing.risk : "moderate") as RiskLevel,
                        detail: ing.detail || "",
                        regulation: ing.regulation || "",
                    })),
                    recommendations: data.analysis.recommendations || [],
                    disclaimer: data.analysis.disclaimer || "This analysis is AI-generated.",
                }
                setAnalysisResult(result)
                saveLocalScan(result)

                // Sync to Supabase if logged in
                if (user) {
                    saveScanToSupabase(supabase, user.id, result)
                }

                setScanState("result")
            } else {
                setErrorMessage("Unexpected response from the server.")
                setScanState("error")
            }
        } catch (err) {
            console.error("Scan error:", err)
            setErrorMessage("Something went wrong. Please check your connection and try again.")
            setScanState("error")
        }

        // Reset file input so the same file can be selected again
        e.target.value = ""
    }, [user, supabase])

    // Scanning progress animation — runs while API call is in progress
    useEffect(() => {
        if (scanState !== "scanning") return

        const progressInterval = setInterval(() => {
            setScanProgress(prev => {
                // Cap at 90% — the remaining 10% completes when we get a response
                if (prev >= 90) {
                    clearInterval(progressInterval)
                    return 90
                }
                return prev + 0.8
            })
        }, 50)

        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev >= scanningSteps.length - 1) {
                    clearInterval(stepInterval)
                    return scanningSteps.length - 1
                }
                return prev + 1
            })
        }, 800)

        return () => {
            clearInterval(progressInterval)
            clearInterval(stepInterval)
        }
    }, [scanState])

    // Score count-up on result
    useEffect(() => {
        if (scanState !== "result" || !analysisResult) return
        let score = 0
        const target = analysisResult.safetyScore
        const timer = setInterval(() => {
            score += 1
            if (score >= target) {
                clearInterval(timer)
                setAnimatedScore(target)
            } else {
                setAnimatedScore(score)
            }
        }, 25)
        return () => clearInterval(timer)
    }, [scanState, analysisResult])

    const circumference = 2 * Math.PI * 54
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference
    const scoreColor = animatedScore >= 70 ? "#10b981" : animatedScore >= 40 ? "#f59e0b" : "#ef4444"

    const resetScan = () => {
        setScanState("idle")
        setScanProgress(0)
        setCurrentStep(0)
        setExpandedIngredient(null)
        setAnimatedScore(0)
        setAnalysisResult(null)
        setErrorMessage("")
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
    }

    return (
        <div className="min-h-screen bg-zinc-50 pb-24 md:pb-8">
            {/* Hidden file inputs */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
                <AnimatePresence mode="wait">
                    {/* ─── IDLE STATE: Upload/Camera ─── */}
                    {scanState === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-2">Scan a Food Label</h1>
                                <p className="text-sm text-zinc-500">Take a photo or upload an image of any food product label</p>
                            </div>

                            {/* Upload Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative border-2 border-dashed border-zinc-200 rounded-3xl p-8 sm:p-12 cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all group"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {/* Scan frame corners */}
                                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-6">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-zinc-900 rounded-tl-xl" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-zinc-900 rounded-tr-xl" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-zinc-900 rounded-bl-xl" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-zinc-900 rounded-br-xl" />

                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-20 h-20 rounded-2xl bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                                                <Camera className="w-8 h-8 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-base font-medium text-zinc-700 mb-1">Point at any food product label</p>
                                    <p className="text-sm text-zinc-400">or tap to upload from gallery</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="flex items-center justify-center gap-2 bg-zinc-900 text-white py-3.5 rounded-2xl text-sm font-medium hover:bg-zinc-800 transition-colors active:scale-[0.98] min-h-[44px]"
                                >
                                    <Camera className="w-4 h-4" />
                                    Take Photo
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center justify-center gap-2 bg-white text-zinc-700 py-3.5 rounded-2xl text-sm font-medium border border-zinc-200 hover:bg-zinc-50 transition-colors active:scale-[0.98] min-h-[44px]"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload Image
                                </button>
                            </div>

                            {/* Info tip */}
                            <div className="mt-8 bg-white rounded-2xl border border-zinc-100 p-4">
                                <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-3">How it works</p>
                                <div className="space-y-2">
                                    {[
                                        "📸 Take a clear photo of the ingredient list on any food package",
                                        "🤖 Our AI analyzes every ingredient against safety databases",
                                        "✅ Get a safety score and detailed breakdown instantly",
                                    ].map((tip, i) => (
                                        <p key={i} className="text-xs text-zinc-600 leading-relaxed">{tip}</p>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── SCANNING STATE ─── */}
                    {scanState === "scanning" && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center"
                        >
                            {/* Image preview */}
                            <div className="relative w-full max-w-sm bg-white rounded-3xl p-4 border border-zinc-100 mb-8 overflow-hidden">
                                {/* Scanning line effect */}
                                <motion.div
                                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent z-10"
                                    animate={{
                                        top: ["0%", "100%", "0%"],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                />

                                {previewUrl ? (
                                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden">
                                        <img src={previewUrl} alt="Label being scanned" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-24 h-24 bg-zinc-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                            <ImageIcon className="w-10 h-10 text-zinc-300" />
                                        </div>
                                        <p className="text-base font-medium text-zinc-900">Processing image...</p>
                                    </div>
                                )}
                            </div>

                            {/* Progress */}
                            <div className="w-full max-w-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                                        <span className="text-sm font-medium text-zinc-700">Analyzing...</span>
                                    </div>
                                    <span className="text-sm text-zinc-400">{Math.round(scanProgress)}%</span>
                                </div>

                                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mb-4">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                                        style={{ width: `${scanProgress}%` }}
                                        transition={{ duration: 0.1 }}
                                    />
                                </div>

                                {/* Steps */}
                                <div className="space-y-2">
                                    {scanningSteps.map((step, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{
                                                opacity: index <= currentStep ? 1 : 0.3,
                                                x: 0,
                                            }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center gap-2"
                                        >
                                            {index < currentStep ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            ) : index === currentStep ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-4 h-4 border border-zinc-200 rounded-full flex-shrink-0" />
                                            )}
                                            <span className={`text-sm ${index <= currentStep ? "text-zinc-700" : "text-zinc-300"}`}>
                                                {step}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── NOT FOOD STATE ─── */}
                    {scanState === "not_food" && (
                        <motion.div
                            key="not_food"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="bg-white rounded-3xl border border-red-100 p-8 sm:p-12 w-full max-w-md">
                                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                                    <Ban className="w-10 h-10 text-red-500" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-3">Not a Food Item</h2>
                                <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                                    {errorMessage}
                                </p>
                                <p className="text-xs text-zinc-400 mb-8">
                                    This tool only analyzes food product labels. Please upload a photo showing the ingredients list of a packaged food item.
                                </p>
                                <button
                                    onClick={resetScan}
                                    className="flex items-center justify-center gap-2 bg-zinc-900 text-white py-3.5 px-8 rounded-2xl text-sm font-medium hover:bg-zinc-800 transition-colors active:scale-[0.98] mx-auto min-h-[44px]"
                                >
                                    <Camera className="w-4 h-4" />
                                    Try Again
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── ERROR STATE ─── */}
                    {scanState === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="bg-white rounded-3xl border border-zinc-100 p-8 sm:p-12 w-full max-w-md">
                                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle className="w-10 h-10 text-amber-500" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-3">Something Went Wrong</h2>
                                <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                                    {errorMessage}
                                </p>
                                <button
                                    onClick={resetScan}
                                    className="flex items-center justify-center gap-2 bg-zinc-900 text-white py-3.5 px-8 rounded-2xl text-sm font-medium hover:bg-zinc-800 transition-colors active:scale-[0.98] mx-auto min-h-[44px]"
                                >
                                    <Camera className="w-4 h-4" />
                                    Try Again
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── RESULT STATE ─── */}
                    {scanState === "result" && analysisResult && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Product Header Card */}
                            <div className="bg-white rounded-3xl border border-zinc-100 p-5 sm:p-6 mb-4">
                                <div className="flex items-start gap-4">
                                    {/* Safety Score Circle */}
                                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                            <circle cx="60" cy="60" r="54" fill="none" stroke="#f4f4f5" strokeWidth="6" />
                                            <circle
                                                cx="60" cy="60" r="54" fill="none"
                                                stroke={scoreColor} strokeWidth="6" strokeLinecap="round"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={strokeDashoffset}
                                                className="transition-all duration-300 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl sm:text-3xl font-bold text-zinc-900">{animatedScore}</span>
                                            <span className="text-[10px] text-zinc-400">/ 100</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 pt-1">
                                        <h2 className="text-lg sm:text-xl font-semibold text-zinc-900">{analysisResult.productName}</h2>
                                        <p className="text-sm text-zinc-500">{analysisResult.brand} · {analysisResult.category}</p>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {analysisResult.fssaiCompliant && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    FSSAI Compliant
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${animatedScore >= 70 ? "bg-emerald-50 text-emerald-700" : animatedScore >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                                                {animatedScore >= 70 ? "Low Risk" : animatedScore >= 40 ? "Moderate Risk" : "High Risk"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick stats */}
                                <div className="grid grid-cols-3 gap-3 mt-5">
                                    {[
                                        { label: "Total", value: analysisResult.ingredients.length, color: "text-zinc-900" },
                                        { label: "Safe", value: analysisResult.ingredients.filter(i => i.risk === "safe").length, color: "text-emerald-600" },
                                        { label: "Risky", value: analysisResult.ingredients.filter(i => i.risk === "high").length, color: "text-red-600" },
                                    ].map((stat, index) => (
                                        <div key={index} className="bg-zinc-50 rounded-xl p-3 text-center">
                                            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ingredient Breakdown */}
                            <div className="bg-white rounded-3xl border border-zinc-100 p-5 sm:p-6 mb-4">
                                <h3 className="text-base font-semibold text-zinc-900 mb-4">Ingredient Breakdown</h3>
                                <div className="space-y-2">
                                    {analysisResult.ingredients.map((ingredient, index) => {
                                        const config = riskConfig[ingredient.risk]
                                        const Icon = config.icon
                                        const isExpanded = expandedIngredient === index

                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.06 }}
                                            >
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
                                                                        <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${config.textColor}`} />
                                                                        <p className={`text-xs ${config.textColor}`}>{ingredient.regulation}</p>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </button>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Recommendations */}
                            {analysisResult.recommendations.length > 0 && (
                                <div className="bg-white rounded-3xl border border-zinc-100 p-5 sm:p-6 mb-4">
                                    <h3 className="text-base font-semibold text-zinc-900 mb-3">Recommendations</h3>
                                    <div className="space-y-2">
                                        {analysisResult.recommendations.map((rec, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-zinc-600 leading-relaxed">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    onClick={resetScan}
                                    className="flex items-center justify-center gap-2 bg-zinc-900 text-white py-3.5 rounded-2xl text-sm font-medium hover:bg-zinc-800 transition-colors active:scale-[0.98] min-h-[44px]"
                                >
                                    <Camera className="w-4 h-4" />
                                    Scan Another
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center justify-center gap-2 bg-white text-zinc-700 py-3.5 rounded-2xl text-sm font-medium border border-zinc-200 hover:bg-zinc-50 transition-colors min-h-[44px]"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Dashboard
                                </Link>
                            </div>

                            {/* Disclaimer */}
                            <p className="text-[10px] text-zinc-400 text-center px-4 mb-4">
                                {analysisResult.disclaimer}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Mobile Bottom Navigation ─── */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-zinc-100 md:hidden safe-area-bottom">
                <div className="flex items-center justify-around py-2 px-4">
                    {[
                        { icon: Scan, label: "Scan", href: "/scan", active: true },
                        { icon: BookOpen, label: "Learn", href: "/learn", active: false },
                        { icon: Clock, label: "History", href: "/dashboard", active: false },
                    ].map((item, index) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors min-h-[44px] min-w-[44px] justify-center ${item.active ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
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
