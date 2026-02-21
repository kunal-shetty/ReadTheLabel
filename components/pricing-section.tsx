"use client"

import { useRef, useEffect, useState } from "react"
import { PropertyBookingCard } from "./property-booking-card"

const products = [
  {
    productName: "Maggi 2-Minute Noodles",
    brand: "Nestle India",
    category: "Instant Food",
    safetyScore: 52,
    riskyIngredientCount: 4,
    totalIngredients: 18,
    topConcern: "Contains Tartrazine (E102) -- synthetic dye linked to hyperactivity",
  },
  {
    productName: "Fair & Lovely Cream",
    brand: "HUL",
    category: "Cosmetics",
    safetyScore: 35,
    riskyIngredientCount: 6,
    totalIngredients: 22,
    topConcern: "Contains mercury compounds -- toxic to skin and kidneys",
  },
  {
    productName: "Parle-G Biscuits",
    brand: "Parle Products",
    category: "Snacks",
    safetyScore: 78,
    riskyIngredientCount: 1,
    totalIngredients: 12,
    topConcern: "Contains palm oil -- high in saturated fats",
  },
  {
    productName: "Dabur Honey",
    brand: "Dabur India",
    category: "Health Food",
    safetyScore: 85,
    riskyIngredientCount: 0,
    totalIngredients: 3,
  },
  {
    productName: "Vim Dishwash Bar",
    brand: "HUL",
    category: "Household",
    safetyScore: 42,
    riskyIngredientCount: 3,
    totalIngredients: 14,
    topConcern: "Contains Sodium Lauryl Sulfate -- skin irritant with prolonged exposure",
  },
  {
    productName: "Colgate MaxFresh",
    brand: "Colgate-Palmolive",
    category: "Oral Care",
    safetyScore: 68,
    riskyIngredientCount: 2,
    totalIngredients: 16,
    topConcern: "Contains Triclosan -- potential endocrine disruptor",
  },
  {
    productName: "Kurkure Masala Munch",
    brand: "PepsiCo India",
    category: "Snacks",
    safetyScore: 45,
    riskyIngredientCount: 5,
    totalIngredients: 24,
    topConcern: "Contains Monosodium Glutamate (MSG) -- may cause headaches in sensitive individuals",
  },
  {
    productName: "Amul Butter",
    brand: "GCMMF",
    category: "Dairy",
    safetyScore: 88,
    riskyIngredientCount: 0,
    totalIngredients: 4,
  },
]

export function PricingSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const positionRef = useRef(0)
  const animationRef = useRef<number>(0)

  const duplicatedProducts = [...products, ...products, ...products]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const speed = isHovered ? 0.3 : 1
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      positionRef.current += speed * (deltaTime / 16)

      const totalWidth = scrollContainer.scrollWidth / 3

      if (positionRef.current >= totalWidth) {
        positionRef.current = 0
      }

      scrollContainer.style.transform = `translateX(-${positionRef.current}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isHovered])

  return (
    <section id="products" className="py-20 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-10 sm:mb-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal mb-4 sm:mb-6 text-balance font-serif">Products analyzed</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          See real safety scores for popular Indian products. From snacks to cosmetics -- know what you are buying.
        </p>
      </div>

      <div className="relative w-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div ref={scrollRef} className="flex gap-6" style={{ width: "fit-content" }}>
          {duplicatedProducts.map((product, index) => (
            <div key={index} className="flex-shrink-0 w-[85vw] sm:w-[60vw] lg:w-[360px]">
              <PropertyBookingCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
