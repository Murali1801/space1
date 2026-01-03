const metrics = [
  { value: "99.99%", label: "Uptime SLA", description: "Enterprise reliability" },
  { value: "10M+", label: "API Requests/Day", description: "Proven at scale" },
  { value: "<50ms", label: "Avg Response", description: "Blazing fast" },
  { value: "150+", label: "Countries", description: "Global reach" },
]

export function ImpactSection() {
  return (
    <section className="px-6 py-32 bg-black border-y border-zinc-900">
      <div className="max-w-7xl mx-auto">
        {/* Impact Section Header */}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 group text-center relative"
            >
              <div className="relative z-10 space-y-3">
                <p className="font-display text-4xl md:text-5xl font-bold text-white group-hover:scale-105 transition-transform duration-500">
                  {metric.value}
                </p>
                <div>
                  <p className="text-sm font-bold text-zinc-300 tracking-tight">{metric.label}</p>
                  <p className="text-xs font-medium text-zinc-500 mt-1">{metric.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
