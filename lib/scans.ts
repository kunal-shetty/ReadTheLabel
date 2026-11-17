/* ─── Types (shared across app) ─── */
export type RiskLevel = "safe" | "moderate" | "high"

export interface Ingredient {
    name: string
    risk: RiskLevel
    detail: string
    regulation: string
}

export interface AnalysisResult {
    productName: string
    brand: string
    category: string
    safetyScore: number
    fssaiCompliant: boolean
    ingredients: Ingredient[]
    recommendations: string[]
    disclaimer: string
}

export interface ScanHistoryItem extends AnalysisResult {
    id: string
    scannedAt: string
}

/* ─── localStorage helpers ─── */
export function getLocalScanHistory(): ScanHistoryItem[] {
    if (typeof window === "undefined") return []
    try {
        const data = localStorage.getItem("scanHistory")
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

export function saveLocalScan(result: AnalysisResult): ScanHistoryItem {
    const history = getLocalScanHistory()
    const item: ScanHistoryItem = {
        ...result,
        id: crypto.randomUUID(),
        scannedAt: new Date().toISOString(),
    }
    history.unshift(item)
    localStorage.setItem("scanHistory", JSON.stringify(history))
    return item
}

export function removeLocalScan(id: string) {
    const history = getLocalScanHistory().filter(item => item.id !== id)
    localStorage.setItem("scanHistory", JSON.stringify(history))
    return history
}

export function clearLocalScanHistory() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("scanHistory")
    }
}
