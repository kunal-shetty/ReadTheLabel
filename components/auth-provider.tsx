"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { syncLocalScansToSupabase } from "@/lib/supabase/scans"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
})

export function useAuth() {
    return useContext(AuthContext)
}

/**
 * Ensure the user has a row in the `profiles` table.
 * The DB trigger `on_auth_user_created` should do this automatically,
 * but this acts as a reliable fallback (e.g. if trigger wasn't created,
 * or if a Google OAuth user slipped through).
 */
async function ensureProfile(supabase: ReturnType<typeof createClient>, user: User) {
    try {
        // Check if profile already exists
        const { data } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single()

        if (data) return // Profile exists, nothing to do

        // Profile doesn't exist — create it
        const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
        }, { onConflict: "id" })

        if (error) {
            console.error("Profile upsert error:", error)
        } else {
            console.log("Profile created for user:", user.id)
        }
    } catch (err) {
        console.error("ensureProfile error:", err)
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
            setLoading(false)

            // Ensure profile exists for already-logged-in users
            if (user) {
                ensureProfile(supabase, user)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null)
                setLoading(false)

                // On sign-in, ensure profile exists, THEN sync localStorage scans
                if (event === "SIGNED_IN" && session?.user) {
                    ensureProfile(supabase, session.user).then(() => {
                        syncLocalScansToSupabase(supabase, session.user.id)
                    })
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        // Clear synced data
        if (typeof window !== "undefined") {
            localStorage.removeItem("scanHistory")
            localStorage.removeItem("scanHistory_synced")
        }
        window.location.href = "/"
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
