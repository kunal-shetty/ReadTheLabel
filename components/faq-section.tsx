import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does the label scanning work?",
    answer:
      "Simply take a photo of any product label or upload an image. Our OCR technology extracts every ingredient from the label, then our AI cross-references each one against multiple safety databases including FSSAI, WHO, FDA, and EU regulations to give you a comprehensive safety analysis.",
  },
  {
    question: "Which regulations does it check against?",
    answer:
      "We check ingredients against FSSAI (Food Safety and Standards Authority of India) regulations, WHO safety guidelines, US FDA approved/banned lists, and EU food additive regulations. This gives you the most comprehensive safety picture available for any product sold in India.",
  },
  {
    question: "Is my data private?",
    answer:
      "Absolutely. We do not store your photos or personal data. Label images are processed in real-time and discarded after analysis. Your scan history is stored locally on your device unless you create an account to sync across devices.",
  },
  {
    question: "What product categories are supported?",
    answer:
      "We support all consumer products including packaged food, beverages, cosmetics, personal care, household cleaning products, baby products, and health supplements. Basically anything with an ingredient label can be scanned and analyzed.",
  },
  {
    question: "How accurate is the AI analysis?",
    answer:
      "Our AI model is trained on over 50,000 verified ingredient safety records and is regularly updated with the latest regulatory changes. We maintain a 95%+ accuracy rate for ingredient identification and risk classification. All safety assessments are backed by cited scientific sources.",
  },
  {
    question: "Is the app free to use?",
    answer:
      "Yes, the basic scanning and safety analysis is completely free. You get unlimited scans, ingredient breakdowns, and safety scores. A premium plan is available for advanced features like personalized health alerts, detailed alternative product recommendations, and family sharing.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-20 sm:py-32 px-4 sm:px-6 pb-40 sm:pb-80">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal mb-4 sm:mb-6 text-balance font-serif">Frequently asked questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about ReadTheLabel. Have a question not listed? Reach out to our support team.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3 py-0 my-0">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-foreground/30"
            >
              <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
