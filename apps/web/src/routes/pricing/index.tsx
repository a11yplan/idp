import { createFileRoute } from '@tanstack/react-router'
import { PricingTable } from 'autumn-js/react'

export const Route = createFileRoute('/pricing/')({
  component: PricingPage,
})

function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your organization. Upgrade or downgrade at any time.
        </p>
      </div>

      {/* Autumn PricingTable - fetches products from your Autumn dashboard */}
      <PricingTable />

      <div className="bg-muted/50 rounded-lg p-8 text-center mt-12">
        <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Contact our sales team for enterprise pricing and custom solutions tailored to your needs.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Contact Sales
        </a>
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Prices exclude any applicable taxes. Cancel anytime.</p>
      </div>
    </div>
  )
}
