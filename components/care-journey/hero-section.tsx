"use client"

import type { JourneyState } from "@/app/page"

interface HeroSectionProps {
  journeyState: JourneyState
}

const heroContent: Record<JourneyState, {
  title: string
  subtitle: string
  startDate: string
  nextReview: string
}> = {
  month_0: {
    title: "Your plan is ready",
    subtitle: "Your starting path has been selected based on your intake and health profile.",
    startDate: "April 2026",
    nextReview: "in 6 weeks"
  },
  week_6: {
    title: "Your plan is active",
    subtitle: "Your topical treatment is moving in the right direction. Early indicators look positive.",
    startDate: "April 2026",
    nextReview: "in 6 weeks"
  },
  month_3: {
    title: "Your plan is responding",
    subtitle: "Three months of consistency. Your scalp is showing clear signs of response.",
    startDate: "April 2026",
    nextReview: "in 4 weeks"
  },
  month_6: {
    title: "Your plan is holding steady",
    subtitle: "Six months completed. Your treatment response remains stable and within the expected range.",
    startDate: "April 2026",
    nextReview: "annual review scheduled"
  }
}

export function HeroSection({ journeyState }: HeroSectionProps) {
  const content = heroContent[journeyState]

  return (
    <section className="rounded-2xl bg-[#FFFCF8] p-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-[#161616] text-balance">
            {content.title}
          </h2>
          <div className="inline-flex w-fit items-center rounded-full border border-[#2F5D50]/20 bg-[#2F5D50]/5 px-3 py-1">
            <span className="font-mono text-xs font-medium text-[#2F5D50]">
              Active plan: Topical treatment
            </span>
          </div>
        </div>
        <p className="font-mono text-base leading-relaxed text-[#5F5A54] text-pretty">
          {content.subtitle}
        </p>
        <div className="mt-4 flex flex-wrap gap-8 text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-[#9A948C]">Started</span>
            <span className="font-sans font-medium text-[#161616]">{content.startDate}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-[#9A948C]">Next review</span>
            <span className="font-sans font-medium text-[#2F5D50]">{content.nextReview}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
