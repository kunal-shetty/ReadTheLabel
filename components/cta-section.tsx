import Link from "next/link"
import { ArrowUpRight, ArrowRight } from "lucide-react"
import { AnimatedRevenueChart } from "./animated-revenue-chart"

export function CTASection() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[14vw] sm:text-[16vw] md:text-[18vw] font-bold font-sans tracking-tighter leading-none text-zinc-100 whitespace-nowrap">
          PROTECT
        </span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal leading-tight max-w-4xl mx-auto mb-4 sm:mb-6 font-serif">
            Start scanning your products today
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            Join lakhs of conscious Indian consumers who scan before they buy. Know what goes into your body and your home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/scan" className="relative flex items-center justify-center gap-0 bg-foreground text-background rounded-full pl-6 pr-1.5 py-2 sm:py-1.5 transition-all duration-300 group overflow-hidden w-full sm:w-auto">
              <span className="text-sm pr-4">Scan Now</span>
              <span className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-foreground" />
              </span>
            </Link>

            <button className="relative flex items-center justify-center gap-0 border border-border rounded-full pl-6 pr-1.5 py-1.5 transition-all duration-300 group overflow-hidden">
              <span className="absolute inset-0 bg-foreground rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300" />
              <span className="text-sm text-foreground group-hover:text-background pr-4 relative z-10 transition-colors duration-300">
                Learn More
              </span>
              <span className="w-10 h-10 rounded-full flex items-center justify-center relative z-10">
                <ArrowRight className="w-4 h-4 text-foreground group-hover:opacity-0 absolute transition-opacity duration-300" />
                <ArrowUpRight className="w-4 h-4 text-foreground group-hover:text-background opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </span>
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-16">
          <AnimatedRevenueChart />
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-16">
          <div className="text-center">
            <p className="text-3xl sm:text-5xl md:text-7xl font-light text-foreground">10L+</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Labels Scanned</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-5xl md:text-7xl font-light text-foreground">5K+</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Products Analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-5xl md:text-7xl font-light text-foreground">500+</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Brands Covered</p>
          </div>
        </div>
      </div>
    </section>
  )
}
