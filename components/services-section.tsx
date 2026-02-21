"use client"

import { Camera, Brain, ShieldCheck } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const services = [
  {
    icon: Camera,
    title: "Scan Any Label",
    description: "Simply point your camera or upload an image of any product label. Our OCR technology instantly extracts every ingredient.",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Google Gemini AI cross-references ingredients against FSSAI, WHO, FDA, and EU safety databases in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Get Results",
    description: "Receive a clear safety score with color-coded risk levels, plain-English explanations, and safer alternatives.",
  },
]

function AnimatedIcon({ Icon, delay = 0 }: { Icon: typeof Camera; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (iconRef.current) {
      observer.observe(iconRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={iconRef} className="relative">
      <Icon
        className={`text-foreground h-16 w-16 ${isVisible ? "animate-draw-icon" : ""}`}
        strokeWidth={1}
        style={{
          strokeDasharray: isVisible ? undefined : 1000,
          strokeDashoffset: isVisible ? undefined : 1000,
        }}
      />
    </div>
  )
}

export function ServicesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6 pb-16 sm:pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-0">
        <span className="font-bold text-center text-[16vw] sm:text-[16vw] md:text-[14vw] lg:text-[12vw] leading-none tracking-tighter text-zinc-100 whitespace-nowrap">
          ANALYZE
        </span>
      </div>

      <style jsx>{`
        @keyframes drawPath {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        :global(.animate-draw-icon) :global(path),
        :global(.animate-draw-icon) :global(line),
        :global(.animate-draw-icon) :global(polyline),
        :global(.animate-draw-icon) :global(circle),
        :global(.animate-draw-icon) :global(rect) {
          animation: drawPath 2s ease-out forwards;
        }
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10">
        <div ref={sectionRef} className="relative px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-10 mb-16 sm:mb-32 overflow-hidden rounded-2xl sm:rounded-3xl">
          <div className="absolute inset-0 w-full h-full">
            <div
              className={`w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 transition-transform duration-1000 ease-out ${isVisible ? "scale-100" : "scale-110"
                }`}
            >
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.08),transparent_50%)]" />
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.06),transparent_50%)]" />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-1 lg:order-2">
              <p className="text-sm uppercase tracking-[0.2em] text-white/80 font-medium mb-4">Our mission</p>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-medium text-white text-balance mb-6 sm:mb-8">
                Making ingredient transparency accessible to every Indian
              </h2>
              <div className="space-y-6 text-white/90 leading-relaxed">
                <p>
                  Most product labels in India are unreadable, tiny fonts, chemical names, and no context about safety.
                  ReadTheLabel changes that with AI-powered instant analysis.
                </p>
                <p>
                  We cross-reference every ingredient against FSSAI regulations, WHO guidelines, and international safety
                  databases. No more guessing. Just clear, actionable information in plain language.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-12 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal mb-4 sm:mb-6 text-balance font-serif">How it works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Three simple steps to understand any product label. No expertise required -- just point, scan, and know.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group p-8 rounded-3xl hover:bg-zinc-50 transition-colors duration-300 text-center"
            >
              <div className="mb-6 flex justify-center">
                <AnimatedIcon Icon={service.icon} delay={index * 0.2} />
              </div>
              <h3 className="text-xl font-medium mb-3 text-foreground">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
