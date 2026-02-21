import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || url === "your_supabase_url_here") {
        // Return a minimal no-op client for build time / missing config
        // This prevents build crashes when env vars aren't set yet
        return createBrowserClient(
            "https://placeholder.supabase.co",
            "placeholder-key"
        )
    }

    return createBrowserClient(url, key)
}
