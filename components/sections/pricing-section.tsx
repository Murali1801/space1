import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    description: "Perfect for side projects and small teams",
    price: "$0",
    period: "forever",
    features: ["Up to 3 team members", "5 projects", "Basic analytics", "Community support", "1GB storage"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For growing teams that need more power",
    price: "$29",
    period: "/month",
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "100GB storage",
      "Custom integrations",
      "API access",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations with custom needs",
    price: "Custom",
    period: "",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom SLA",
      "On-premise deployment",
      "Unlimited storage",
      "Advanced security",
      "Training & onboarding",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-32 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4">Investment</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Choose the plan that's right for you. All plans include 24/7 priority support and access to our latest models.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-12 rounded-[40px] border flex flex-col h-full transition-all duration-500 hover:translate-y-[-8px] ${plan.highlighted
                  ? "bg-white border-white shadow-[0_32px_64px_-12px_rgba(255,255,255,0.2)]"
                  : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                }`}
            >
              {/* Plan Header */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-2xl font-bold ${plan.highlighted ? "text-black" : "text-white"}`}>
                    {plan.name}
                  </h3>
                  {plan.highlighted && (
                    <span className="px-3 py-1 rounded-full bg-black text-[10px] font-bold text-white uppercase tracking-widest">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className={`text-sm font-medium leading-relaxed ${plan.highlighted ? "text-zinc-600" : "text-zinc-500"}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-display font-bold ${plan.highlighted ? "text-black" : "text-white"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm font-bold uppercase tracking-widest ${plan.highlighted ? "text-zinc-500" : "text-zinc-600"}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-12 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-4">
                    <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlighted ? "bg-black" : "bg-zinc-800"
                      }`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? "text-white" : "text-zinc-400"}`} />
                    </div>
                    <span className={`text-sm font-medium ${plan.highlighted ? "text-zinc-800" : "text-zinc-400"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href="/signup">
                <button
                  className={`w-full py-5 px-8 rounded-2xl font-bold text-sm transition-all duration-300 ${plan.highlighted
                      ? "bg-black text-white hover:bg-zinc-800 shadow-xl"
                      : "bg-white text-black hover:bg-zinc-200"
                    }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
