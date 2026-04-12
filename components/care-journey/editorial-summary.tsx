"use client"

import type { PenJourneyStateView } from "@/lib/pen/contracts"

interface EditorialSummaryProps {
  journeyView: PenJourneyStateView
}

export function EditorialSummary({ journeyView }: EditorialSummaryProps) {
  return (
    <section className="rounded-2xl bg-[#FFFCF8] p-8">
      <h3 className="mb-4 font-mono text-xs font-medium uppercase tracking-wide text-[#9A948C]">
        {journeyView.narrative.title}
      </h3>
      <p className="font-mono text-base leading-relaxed text-[#161616] text-pretty">
        {journeyView.narrative.text}
      </p>
    </section>
  )
}
