"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatedText } from "./animated-text"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let rafId: number
    let currentProgress = 0

    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = 400
      const targetProgress = Math.min(scrollY / maxScroll, 1)

      const smoothUpdate = () => {
        currentProgress += (targetProgress - currentProgress) * 0.1

        if (Math.abs(targetProgress - currentProgress) > 0.001) {
          setScrollProgress(currentProgress)
          rafId = requestAnimationFrame(smoothUpdate)
        } else {
          setScrollProgress(targetProgress)
        }
      }

      cancelAnimationFrame(rafId)
      smoothUpdate()
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const easeOutQuad = (t: number) => t * (2 - t)
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  const scale = 1 - easeOutQuad(scrollProgress) * 0.15
  const borderRadius = easeOutCubic(scrollProgress) * 48
  const heightVh = 100 - easeOutQuad(scrollProgress) * 37.5

  return (
    <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 min-h-screen flex items-center relative overflow-hidden">
      <div className="absolute inset-0 top-0">
        <div
          className="w-full will-change-transform overflow-hidden"
          style={{
            transform: `scale(${scale})`,
            borderRadius: `${borderRadius}px`,
            height: `${heightVh}vh`,
          }}
        >
          <div className="w-full h-full bg-zinc-900 relative">
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-emerald-950" />
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none z-[5] flex items-end justify-center"
        style={{
          transform: `translateY(${scrollProgress * 150}px)`,
          opacity: 1 - scrollProgress * 0.8,
          height: "100%",
        }}
      >
        <span
          className="block text-white font-bold text-[16vw] sm:text-[16vw] md:text-[14vw] lg:text-[12vw] tracking-tighter select-none text-center leading-none"
          style={{ marginBottom: "0" }}
        >
          SCAN
        </span>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-12">
          <div
            className={`transition-all duration-1000 delay-[400ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-sm text-white mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI-Powered Label Analysis for India
            </span>
          </div>
          <div
            className={`transition-all duration-1000 delay-[800ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <h1 className="font-serif text-[2rem] sm:text-[3rem] md:text-[4.5rem] lg:text-[6rem] xl:text-[7rem] font-normal leading-tight mb-4 sm:mb-6 w-full px-2 sm:px-4 max-w-6xl mx-auto text-balance text-white">
              <AnimatedText text="Know What You Consume" delay={0.3} />
            </h1>
          </div>
          <div
            className={`transition-all duration-1000 delay-[1200ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
              Scan any product label. Get instant AI-powered safety analysis.
              Built for Indian consumers who care about what goes into their body.
            </p>
          </div>
          <div
            className={`transition-all duration-1000 delay-[1600ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Link href="/scan" className="w-full sm:w-auto relative flex items-center justify-center gap-0 bg-white text-black border border-white rounded-full pl-6 pr-1.5 py-2 sm:py-1.5 transition-all duration-300 group overflow-hidden hover:bg-zinc-100">
                <span className="text-sm font-medium pr-3">
                  Start Scanning
                </span>
                <span className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                  <svg className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </span>
              </Link>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.getElementById("how-it-works")
                  if (el) {
                    const offset = el.getBoundingClientRect().top + window.scrollY - 100
                    window.scrollTo({ top: offset, behavior: "smooth" })
                  }
                }}
                className="text-sm text-white/60 hover:text-white transition-colors underline underline-offset-4 decoration-white/30"
              >
                See how it works
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div
              className={`relative w-[180px] sm:w-[234px] md:w-[281px] lg:w-[351px] will-change-transform transition-all duration-[1500ms] ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[400px]"
                }`}
            >
              <div className="bg-zinc-950 rounded-[2.5rem] sm:rounded-[3rem] p-2 sm:p-3 shadow-2xl border border-zinc-800">
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
                  <div className="flex items-center justify-center py-2 bg-zinc-50">
                    <div className="w-20 h-4 bg-zinc-900 rounded-full" />
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-800">ReadTheLabel</span>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-3 text-center">
                      <p className="text-[9px] text-zinc-400 uppercase tracking-wider">Safety Score</p>
                      <p className="text-3xl font-bold text-emerald-500">78</p>
                      <p className="text-[10px] text-zinc-500">Parle-G Biscuits</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[9px] text-zinc-600">Wheat Flour</span>
                        <span className="ml-auto text-[8px] text-emerald-500 font-medium">SAFE</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-[9px] text-zinc-600">Palm Oil</span>
                        <span className="ml-auto text-[8px] text-amber-500 font-medium">MODERATE</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[9px] text-zinc-600">Sugar</span>
                        <span className="ml-auto text-[8px] text-emerald-500 font-medium">SAFE</span>
                      </div>
                    </div>
                    <div className="bg-zinc-900 text-white text-[10px] font-medium py-2 rounded-lg text-center">Scan Another</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
