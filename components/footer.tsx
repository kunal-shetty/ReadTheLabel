import Link from "next/link"
import { Twitter, Linkedin, Instagram, Github, Sparkles } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Scan Label", href: "#" },
    { label: "Product Database", href: "#" },
    { label: "Safety Scores", href: "#" },
    { label: "Mobile App", href: "#" },
  ],
  resources: [
    { label: "Ingredient Guide", href: "#" },
    { label: "FSSAI Standards", href: "#" },
    { label: "Research", href: "#" },
    { label: "Blog", href: "#" },
  ],
  legal: [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Cookies", href: "#" },
    { label: "Disclaimer", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Contact", href: "#" },
    { label: "FAQ", href: "#faq" },
    { label: "Report Issue", href: "#" },
  ],
}

export function Footer() {
  return (
    <div className="relative">
      <div className="absolute -top-[20vw] left-0 right-0 w-full h-[50vw] z-0 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-zinc-900/80 to-zinc-950" />
      </div>

      <div className="absolute -top-[15vw] left-0 right-0 flex items-end justify-center overflow-hidden pointer-events-none z-10">
        <h2 className="font-bold text-center text-[10vw] sm:text-[12vw] md:text-[13vw] lg:text-[13vw] leading-[0.85] tracking-tighter text-white whitespace-nowrap">
          READTHELABEL
        </h2>
      </div>

      <footer id="contact" className="relative z-20 border-t border-border py-10 sm:py-16 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-foreground" />
                <span className="text-base font-medium text-foreground">ReadTheLabel</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-6">Know what you consume.</p>
              <div className="flex gap-4">
                <Link
                  href="#"
                  className="w-9 h-9 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </Link>
                <Link
                  href="#"
                  className="w-9 h-9 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </Link>
                <Link
                  href="#"
                  className="w-9 h-9 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </Link>
                <Link
                  href="#"
                  className="w-9 h-9 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wider">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">2026 ReadTheLabel. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Making ingredient transparency accessible to every Indian.</p>
          </div>
        </div>
      </footer>
    </div >
  )
}
