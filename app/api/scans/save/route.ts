import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        // Verify the user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to save scans." },
                { status: 401 }
            )
        }

        const body = await req.json()

        const { productName, brand, category, safetyScore, fssaiCompliant, ingredients, recommendations, disclaimer } = body

        if (!productName || safetyScore === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: productName and safetyScore" },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from("scans")
            .insert({
                user_id: user.id,
                product_name: productName,
                brand: brand || "",
                category: category || "Food",
                safety_score: safetyScore,
                fssai_compliant: fssaiCompliant || false,
                ingredients: ingredients || [],
                recommendations: recommendations || [],
                disclaimer: disclaimer || "",
            })
            .select("id")
            .single()

        if (error) {
            console.error("[API] Scan save error:", error)
            return NextResponse.json(
                { error: "Failed to save scan." },
                { status: 500 }
            )
        }

        return NextResponse.json({ id: data.id })

    } catch (error) {
        console.error("[API] Unexpected error:", error)
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        )
    }
}
