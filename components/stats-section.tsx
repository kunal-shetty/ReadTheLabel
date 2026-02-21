"use client"
import { useEffect, useState } from "react"

function useCountUp(end: number, duration = 2000, suffix = "") {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, hasStarted])

  return { value: count + suffix, start: () => setHasStarted(true), hasStarted }
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)

  const ingredients = useCountUp(5000, 2000, "+")
  const additives = useCountUp(150, 2000, "+")
  const scans = useCountUp(10, 2000, "L+")

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          ingredients.start()
          additives.start()
          scans.start()
        }
      },
      { threshold: 0.3 },
    )

    const section = document.getElementById("stats-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [isVisible])

  return (
    <section id="stats-section" className="py-16 sm:py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
          <div
            className={`text-center transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="font-light text-foreground mb-2 text-5xl sm:text-6xl md:text-7xl leading-none">{ingredients.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Ingredients Analyzed</p>
          </div>

          <div
            className={`text-center transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="font-light text-foreground mb-2 text-5xl sm:text-6xl md:text-7xl leading-none">{additives.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Harmful Additives Tracked</p>
          </div>

          <div
            className={`text-center transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="font-light text-foreground mb-2 text-5xl sm:text-6xl md:text-7xl leading-none">{scans.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Labels Scanned</p>
          </div>
        </div>
      </div>
    </section>
  )
}
