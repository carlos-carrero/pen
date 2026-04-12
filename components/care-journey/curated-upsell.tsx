"use client"

import { Droplets, Sparkles, Package, Leaf } from "lucide-react"
import type { PenJourneyStateView } from "@/lib/pen/contracts"

interface CuratedUpsellProps {
  journeyView: PenJourneyStateView
}

const iconMap = {
  droplets: Droplets,
  sparkles: Sparkles,
  package: Package,
  leaf: Leaf
}

export function CuratedUpsell({ journeyView }: CuratedUpsellProps) {
  const content = journeyView.recommendation

  if (!content.show) {
    return null
  }

  const IconComponent = iconMap[content.icon || "sparkles"]

  return (
    <section className="rounded-2xl bg-[#FFFCF8] p-6">
      <h3 className="mb-5 font-mono text-xs font-medium uppercase tracking-wide text-[#9A948C]">
        Selected for your current plan
      </h3>
      <div className="flex gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#F6F1E8]">
          <IconComponent className="h-7 w-7 text-[#5E7C6B]" />
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-sans text-base font-medium text-[#161616]">
            {content.product}
          </h4>
          <p className="font-mono text-sm leading-relaxed text-[#5F5A54]">
            {content.description}
          </p>
          <button className="mt-3 w-fit rounded-lg border border-[#2F5D50] bg-transparent px-4 py-2 font-sans text-sm font-medium text-[#2F5D50] transition-colors hover:bg-[#2F5D50] hover:text-white">
            View details
          </button>
        </div>
      </div>
    </section>
  )
}
