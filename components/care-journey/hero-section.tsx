"use client"

import type { PenJourneyStateView } from "@/lib/pen/contracts"

interface HeroSectionProps {
  journeyView: PenJourneyStateView
}

export function HeroSection({ journeyView }: HeroSectionProps) {
  const hero = journeyView.hero

  return (
    <section className="rounded-2xl bg-[#FFFCF8] p-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-[#161616] text-balance">
            {hero.title}
          </h2>
          <div className="inline-flex w-fit items-center rounded-full border border-[#2F5D50]/20 bg-[#2F5D50]/5 px-3 py-1">
            <span className="font-mono text-xs font-medium text-[#2F5D50]">
              {hero.active_plan_label}
            </span>
          </div>
        </div>
        <p className="font-mono text-base leading-relaxed text-[#5F5A54] text-pretty">
          {hero.subtitle}
        </p>
        <div className="mt-4 flex flex-wrap gap-8 text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-[#9A948C]">Started</span>
            <span className="font-sans font-medium text-[#161616]">{hero.start_date}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-[#9A948C]">Next review</span>
            <span className="font-sans font-medium text-[#2F5D50]">{hero.next_review}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
