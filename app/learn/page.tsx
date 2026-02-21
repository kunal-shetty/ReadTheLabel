"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import {
    Sparkles, BookOpen, Scan, Clock, AlertTriangle, ShieldCheck,
    XCircle, ChevronDown, Beaker, FileText, Apple, Ban,
    Heart, Baby, Leaf, Flame, Search, Tag, Calendar,
    CandyOff, Scale, LogOut, type LucideIcon
} from "lucide-react"

/* ─── Data ─── */
const quickTips: { icon: LucideIcon; title: string; description: string; color: string }[] = [
    {
        icon: Search,
        color: "bg-amber-50 text-amber-600",
        title: "Check the First 3 Ingredients",
        description: "Ingredients are listed by quantity. The first 3 make up most of the product — if sugar or palm oil tops the list, reconsider.",
    },
    {
        icon: AlertTriangle,
        color: "bg-orange-50 text-orange-600",
        title: "Watch for 'E-Numbers'",
        description: "Codes like E621 (MSG), E102 (Tartrazine), E211 (Sodium Benzoate) are food additives. Some are safe, many are not.",
    },
    {
        icon: Tag,
        color: "bg-blue-50 text-blue-600",
        title: "Look for FSSAI License",
        description: "Every packaged food in India must display a 14-digit FSSAI license number. No number = not verified.",
    },
    {
        icon: Calendar,
        color: "bg-violet-50 text-violet-600",
        title: "Best Before ≠ Expiry",
        description: "'Best before' means quality may decline after. 'Use by' means do NOT consume after. Know the difference.",
    },
    {
        icon: CandyOff,
        color: "bg-pink-50 text-pink-600",
        title: "Hidden Sugars Have Many Names",
        description: "Maltodextrin, dextrose, corn syrup, invert sugar, HFCS — these are all sugar in disguise.",
    },
    {
        icon: Scale,
        color: "bg-teal-50 text-teal-600",
        title: "Check Serving Sizes",
        description: "A packet may say '100 calories per serving' but contain 3 servings. Always multiply by servings per pack.",
    },
]

const harmfulIngredients = [
    {
        name: "Tartrazine (E102)",
        risk: "high" as const,
        category: "Synthetic Dye",
        detail: "Yellow food colouring linked to hyperactivity in children. Banned or restricted in parts of the EU.",
        found: "Instant noodles, snacks, cold drinks, sweets",
    },
    {
        name: "Monosodium Glutamate (MSG / E621)",
        risk: "moderate" as const,
        category: "Flavour Enhancer",
        detail: "Can cause headaches, nausea, and 'Chinese Restaurant Syndrome' in sensitive individuals.",
        found: "Chips, instant noodles, ready-to-eat meals, soups",
    },
    {
        name: "Sodium Benzoate (E211)",
        risk: "high" as const,
        category: "Preservative",
        detail: "When combined with Vitamin C, can form benzene — a known carcinogen. Common in acidic drinks.",
        found: "Soft drinks, sauces, pickles, fruit juices",
    },
    {
        name: "Trans Fats (Partially Hydrogenated Oil)",
        risk: "high" as const,
        category: "Fat",
        detail: "Directly linked to heart disease, increases LDL cholesterol. FSSAI has capped trans fat at 2% since 2022.",
        found: "Biscuits, bakery items, margarine, fried snacks",
    },
    {
        name: "High Fructose Corn Syrup (HFCS)",
        risk: "moderate" as const,
        category: "Sweetener",
        detail: "Excessive consumption linked to obesity, diabetes, and liver damage. Very common in processed foods.",
        found: "Juices, ketchup, bread, cereals, flavoured yogurt",
    },
    {
        name: "BHA / BHT (E320 / E321)",
        risk: "moderate" as const,
        category: "Preservative",
        detail: "Antioxidant preservatives. Some studies show potential endocrine disruption and carcinogenic effects.",
        found: "Cooking oils, chips, cereals, chewing gum",
    },
    {
        name: "Potassium Bromate",
        risk: "high" as const,
        category: "Flour Treatment",
        detail: "Classified as possibly carcinogenic by IARC. Banned in EU, India, and many countries but still found illegally.",
        found: "Bread, pav, baked goods",
    },
    {
        name: "Aspartame (E951)",
        risk: "moderate" as const,
        category: "Artificial Sweetener",
        detail: "WHO classified as 'possibly carcinogenic' in 2023. Safe within daily limits per FSSAI but controversial.",
        found: "Diet drinks, sugar-free products, chewing gum",
    },
]

const fssaiBasics = [
    {
        icon: FileText,
        title: "14-Digit License Number",
        description: "Every packaged food must display a 14-digit FSSAI license number starting with the state code. You can verify this at foscos.fssai.gov.in.",
    },
    {
        icon: ShieldCheck,
        title: "The FSSAI Logo",
        description: "Look for the green triangle FSSAI logo on packaging. It indicates the manufacturer has a valid food license.",
    },
    {
        icon: Beaker,
        title: "Nutritional Info Panel",
        description: "FSSAI mandates that all packaged foods display nutritional information per 100g/ml and per serve, including energy, protein, carbs, fat, and added sugar.",
    },
    {
        icon: Ban,
        title: "Banned Ingredients",
        description: "FSSAI maintains a list of prohibited ingredients. If a product contains potassium bromate, brominated vegetable oil, or certain dyes, it violates regulations.",
    },
]

const labelGuide = [
    {
        icon: Apple,
        title: "Ingredients List",
        tip: "Listed in descending order by weight. The first ingredient is what the product contains the most of.",
    },
    {
        icon: Flame,
        title: "Energy (kcal)",
        tip: "Average adults need ~2000 kcal/day. If a single snack has 400+ kcal, it's nearly a quarter of your daily intake.",
    },
    {
        icon: Heart,
        title: "Fats",
        tip: "Look at saturated fat and trans fat separately. WHO recommends <10% of daily calories from saturated fat. Trans fat should be zero.",
    },
    {
        icon: Leaf,
        title: "Added Sugar",
        tip: "FSSAI now requires 'added sugar' to be listed separately. WHO recommends <25g of added sugar per day for adults.",
    },
    {
        icon: Baby,
        title: "Allergen Info",
        tip: "Look for bold text at the end of ingredients saying 'Contains: milk, wheat, soy' etc. Critical for people with allergies.",
    },
]

const riskConfig = {
    moderate: { label: "MODERATE", bgColor: "bg-amber-50", textColor: "text-amber-700", dotColor: "bg-amber-500" },
    high: { label: "HIGH RISK", bgColor: "bg-red-50", textColor: "text-red-700", dotColor: "bg-red-500" },
}

/* ─── Learn Page ─── */
export default function LearnPage() {
    const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null)
    const { user, signOut } = useAuth()

    return (
        <div className="min-h-screen bg-zinc-50 pb-24 md:pb-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-2">Food Safety Guide</h1>
                    <p className="text-sm text-zinc-500">Learn to read labels, spot harmful ingredients, and make safer choices</p>
                </motion.div>

                {/* ─── Quick Tips ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mb-6"
                >
                    <h2 className="text-base font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                        Quick Tips
                    </h2>
                    <div className="grid gap-3">
                        {quickTips.map((tip, i) => {
                            const TipIcon = tip.icon
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-2xl border border-zinc-100 p-4 flex gap-3"
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tip.color}`}>
                                        <TipIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-zinc-900 mb-1">{tip.title}</h3>
                                        <p className="text-xs text-zinc-500 leading-relaxed">{tip.description}</p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.section>

                {/* ─── Harmful Ingredients ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mb-6"
                >
                    <h2 className="text-base font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        </span>
                        Ingredients to Watch
                    </h2>
                    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                        {harmfulIngredients.map((item, i) => {
                            const config = riskConfig[item.risk]
                            const isExpanded = expandedIngredient === i
                            return (
                                <div key={i} className={`${i > 0 ? "border-t border-zinc-50" : ""}`}>
                                    <button
                                        onClick={() => setExpandedIngredient(isExpanded ? null : i)}
                                        className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-zinc-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dotColor}`} />
                                            <span className="text-sm text-zinc-800 truncate">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}>
                                                {config.label}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                        </div>
                                    </button>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className="px-4 pb-3"
                                        >
                                            <div className="pl-4 space-y-2">
                                                <p className="text-xs text-zinc-400 uppercase tracking-wider">{item.category}</p>
                                                <p className="text-sm text-zinc-600 leading-relaxed">{item.detail}</p>
                                                <p className="text-xs text-zinc-500">
                                                    <span className="font-medium text-zinc-700">Found in: </span>
                                                    {item.found}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </motion.section>

                {/* ─── FSSAI Basics ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="mb-6"
                >
                    <h2 className="text-base font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                        FSSAI Basics
                    </h2>
                    <div className="grid gap-3">
                        {fssaiBasics.map((item, i) => {
                            const Icon = item.icon
                            return (
                                <div key={i} className="bg-white rounded-2xl border border-zinc-100 p-4 flex gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-zinc-900 mb-1">{item.title}</h3>
                                        <p className="text-xs text-zinc-500 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.section>

                {/* ─── Reading Labels 101 ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="mb-6"
                >
                    <h2 className="text-base font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        </span>
                        Reading Labels 101
                    </h2>
                    <div className="grid gap-3">
                        {labelGuide.map((item, i) => {
                            const Icon = item.icon
                            return (
                                <div key={i} className="bg-white rounded-2xl border border-zinc-100 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Icon className="w-3.5 h-3.5 text-blue-600" />
                                        </div>
                                        <h3 className="text-sm font-medium text-zinc-900">{item.title}</h3>
                                    </div>
                                    <p className="text-xs text-zinc-500 leading-relaxed pl-9">{item.tip}</p>
                                </div>
                            )
                        })}
                    </div>
                </motion.section>

                {/* ─── CTA ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="bg-zinc-900 rounded-2xl p-6 text-center mb-4"
                >
                    <h3 className="text-lg font-semibold text-white mb-2">Ready to check your food?</h3>
                    <p className="text-sm text-zinc-400 mb-4">Scan any product label and get an instant AI safety analysis</p>
                    <Link
                        href="/scan"
                        className="inline-flex items-center gap-2 bg-white text-zinc-900 px-6 py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors min-h-[44px]"
                    >
                        <Scan className="w-4 h-4" />
                        Start Scanning
                    </Link>
                </motion.div>

                {/* Disclaimer */}
                <p className="text-[10px] text-zinc-400 text-center px-4 mb-4">
                    This information is for educational purposes only. Always consult healthcare professionals for specific dietary concerns.
                </p>
            </div>

            {/* ─── Mobile Bottom Navigation ─── */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-zinc-100 md:hidden safe-area-bottom">
                <div className="flex items-center justify-around py-2 px-4">
                    {[
                        { icon: Scan, label: "Scan", href: "/scan", active: false },
                        { icon: BookOpen, label: "Learn", href: "/learn", active: true },
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
