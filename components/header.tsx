"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowUpRight, ArrowRight, Sparkles, LogOut, User as UserIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "./auth-provider"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const isScrolled = true
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const isHomePage = pathname === "/"

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()

    if (!isHomePage) {
      // If not on homepage, navigate to homepage with hash
      window.location.href = `/#${targetId}`
      return
    }

    const element = document.getElementById(targetId)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
      setIsOpen(false)
    }
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (!isHomePage) {
      window.location.href = "/"
      return
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const navLinks = [
    { label: "How It Works", id: "how-it-works" },
    { label: "Features", id: "features" },
    { label: "Demo", id: "products" },
    { label: "Reviews", id: "testimonials" },
    { label: "FAQ", id: "faq" },
  ]

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U"

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "px-3 sm:px-4 pt-3 sm:pt-4" : ""}`}>
      <div
        className={`max-w-7xl mx-auto transition-all duration-300 rounded-2xl ${isScrolled
          ? "bg-white/70 backdrop-blur-xl border border-zinc-200 px-4 sm:px-6 py-3"
          : "bg-background/90 backdrop-blur-md px-4 sm:px-6 py-5"
          }`}
      >
        <div className="flex items-center justify-between">
          <a href="#" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <Sparkles
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
            />
            <span
              className={`text-base sm:text-lg font-medium tracking-tight transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
            >
              ReadTheLabel
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`/#${link.id}`}
                onClick={(e) => handleSmoothScroll(e, link.id)}
                className={`text-sm transition-colors cursor-pointer ${isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`text-sm px-4 py-2 rounded-full transition-colors ${isScrolled ? "text-zinc-600 hover:text-black hover:bg-zinc-100" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/scan"
                      className={`relative flex items-center gap-0 border rounded-full pl-5 pr-1 py-1 transition-all duration-300 group overflow-hidden ${isScrolled ? "border-zinc-300" : "border-border"
                        }`}
                    >
                      <span className={`absolute inset-0 rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300 ${isScrolled ? "bg-black" : "bg-foreground"}`} />
                      <span className={`text-sm pr-3 relative z-10 transition-colors duration-300 ${isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"}`}>
                        Scan a Label
                      </span>
                      <span className="w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                        <ArrowRight className={`w-4 h-4 group-hover:opacity-0 absolute transition-opacity duration-300 ${isScrolled ? "text-black" : "text-foreground"}`} />
                        <ArrowUpRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"}`} />
                      </span>
                    </Link>
                    {/* User avatar + logout */}
                    <div className="flex items-center gap-1 ml-1">
                      <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center">
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-semibold text-white">{userInitials}</span>
                        )}
                      </div>
                      <button
                        onClick={signOut}
                        className="text-zinc-400 hover:text-zinc-700 p-2 rounded-lg transition-colors"
                        title="Sign out"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`text-sm px-4 py-2 rounded-full transition-colors ${isScrolled ? "text-zinc-600 hover:text-black hover:bg-zinc-100" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className={`relative flex items-center gap-0 border rounded-full pl-5 pr-1 py-1 transition-all duration-300 group overflow-hidden ${isScrolled ? "border-zinc-300" : "border-border"
                        }`}
                    >
                      <span className={`absolute inset-0 rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300 ${isScrolled ? "bg-black" : "bg-foreground"}`} />
                      <span className={`text-sm pr-3 relative z-10 transition-colors duration-300 ${isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"}`}>
                        Get Started
                      </span>
                      <span className="w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                        <ArrowRight className={`w-4 h-4 group-hover:opacity-0 absolute transition-opacity duration-300 ${isScrolled ? "text-black" : "text-foreground"}`} />
                        <ArrowUpRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"}`} />
                      </span>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <button
            className={`lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`lg:hidden overflow-hidden`}
            >
              <div className={`mt-4 pb-5 flex flex-col gap-1 border-t pt-4 ${isScrolled ? "border-zinc-200" : "border-border"}`}>
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`/#${link.id}`}
                    onClick={(e) => handleSmoothScroll(e, link.id)}
                    className={`min-h-[44px] flex items-center px-3 rounded-xl transition-colors cursor-pointer ${isScrolled ? "text-zinc-600 hover:text-black hover:bg-zinc-50" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {link.label}
                  </a>
                ))}

                {!loading && (
                  <div className={`mt-2 pt-3 border-t ${isScrolled ? "border-zinc-200" : "border-border"}`}>
                    {user ? (
                      <>
                        <Link
                          href="/dashboard"
                          className={`min-h-[44px] flex items-center px-3 rounded-xl transition-colors ${isScrolled ? "text-zinc-600 hover:text-black hover:bg-zinc-50" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/scan"
                          className={`min-h-[44px] flex items-center px-3 rounded-xl transition-colors mt-1 ${isScrolled ? "text-zinc-600 hover:text-black hover:bg-zinc-50" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Scan a Label
                        </Link>
                        <button
                          onClick={signOut}
                          className="min-h-[44px] flex items-center gap-2 px-3 rounded-xl transition-colors mt-1 text-red-500 hover:text-red-700 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className={`min-h-[44px] flex items-center px-3 rounded-xl transition-colors ${isScrolled ? "text-zinc-600 hover:text-black hover:bg-zinc-50" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Login
                        </Link>
                        <Link
                          href="/signup"
                          className="mt-2 relative flex items-center gap-0 border rounded-full pl-5 pr-1 py-1.5 w-fit transition-all duration-300 group overflow-hidden border-zinc-300"
                        >
                          <span className="absolute inset-0 rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300 bg-black" />
                          <span className="text-sm pr-3 relative z-10 transition-colors duration-300 text-black group-hover:text-white">
                            Get Started
                          </span>
                          <span className="w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                            <ArrowRight className="w-4 h-4 group-hover:opacity-0 absolute transition-opacity duration-300 text-black" />
                            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 text-black group-hover:text-white" />
                          </span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
