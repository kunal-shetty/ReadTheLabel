import type { SupabaseClient } from "@supabase/supabase-js"

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

export function setLocalScanHistory(items: ScanHistoryItem[]) {
    if (typeof window !== "undefined") {
        localStorage.setItem("scanHistory", JSON.stringify(items))
    }
}

export function removeLocalScan(id: string) {
    const history = getLocalScanHistory().filter(item => item.id !== id)
    localStorage.setItem("scanHistory", JSON.stringify(history))
    return history
}

export function clearLocalScanHistory() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("scanHistory")
        localStorage.removeItem("scanHistory_synced")
    }
}

/* ─── Supabase → local mapping ─── */
function mapRowToScanItem(row: Record<string, unknown>): ScanHistoryItem {
    return {
        id: row.id as string,
        productName: row.product_name as string,
        brand: (row.brand as string) || "",
        category: (row.category as string) || "Food",
        safetyScore: row.safety_score as number,
        fssaiCompliant: (row.fssai_compliant as boolean) || false,
        ingredients: (row.ingredients as Ingredient[]) || [],
        recommendations: (row.recommendations as string[]) || [],
        disclaimer: (row.disclaimer as string) || "",
        scannedAt: row.created_at as string,
    }
}

/* ─── Supabase CRUD ─── */

/** Insert a single scan for the authenticated user */
export async function saveScanToSupabase(
    supabase: SupabaseClient,
    userId: string,
    result: AnalysisResult
): Promise<{ id: string | null; error: string | null }> {
    const { data, error } = await supabase
        .from("scans")
        .insert({
            user_id: userId,
            product_name: result.productName,
            brand: result.brand,
            category: result.category,
            safety_score: result.safetyScore,
            fssai_compliant: result.fssaiCompliant,
            ingredients: result.ingredients,
            recommendations: result.recommendations,
            disclaimer: result.disclaimer,
        })
        .select("id")
        .single()

    if (error) {
        console.error("Supabase save error:", error)
        return { id: null, error: error.message }
    }

    return { id: data?.id ?? null, error: null }
}

/** Fetch all scans for a user, most recent first */
export async function fetchUserScans(
    supabase: SupabaseClient,
    userId: string
): Promise<{ items: ScanHistoryItem[]; error: string | null }> {
    const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Supabase fetch error:", error)
        return { items: [], error: error.message }
    }

    const items = (data || []).map(mapRowToScanItem)
    return { items, error: null }
}

/** Delete a single scan by ID (must belong to the user via RLS) */
export async function deleteScanFromSupabase(
    supabase: SupabaseClient,
    scanId: string
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from("scans")
        .delete()
        .eq("id", scanId)

    if (error) {
        console.error("Supabase delete error:", error)
        return { error: error.message }
    }
    return { error: null }
}

/** Delete all scans for a user */
export async function deleteAllUserScans(
    supabase: SupabaseClient,
    userId: string
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from("scans")
        .delete()
        .eq("user_id", userId)

    if (error) {
        console.error("Supabase delete-all error:", error)
        return { error: error.message }
    }
    return { error: null }
}

/**
 * Sync localStorage scans → Supabase.
 * Reads current localStorage scans, batch-inserts them to Supabase,
 * then replaces localStorage with the canonical Supabase data.
 */
export async function syncLocalScansToSupabase(
    supabase: SupabaseClient,
    userId: string
): Promise<void> {
    const localScans = getLocalScanHistory()
    if (localScans.length === 0) return

    // Check if already synced
    const syncedFlag = localStorage.getItem("scanHistory_synced")
    if (syncedFlag) return

    // Batch insert local scans that might not exist in Supabase
    const rows = localScans.map(scan => ({
        user_id: userId,
        product_name: scan.productName,
        brand: scan.brand,
        category: scan.category,
        safety_score: scan.safetyScore,
        fssai_compliant: scan.fssaiCompliant,
        ingredients: scan.ingredients,
        recommendations: scan.recommendations,
        disclaimer: scan.disclaimer,
    }))

    const { error } = await supabase.from("scans").insert(rows)

    if (error) {
        console.error("Sync to Supabase error:", error)
        return
    }

    // Now fetch the canonical data from Supabase
    const { items } = await fetchUserScans(supabase, userId)
    setLocalScanHistory(items)
    localStorage.setItem("scanHistory_synced", Date.now().toString())
}
