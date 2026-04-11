"use client"

import type { JourneyState } from "@/app/page"

interface EditorialSummaryProps {
  journeyState: JourneyState
}

const summaryContent: Record<JourneyState, { title: string; text: string }> = {
  month_0: {
    title: "How your plan begins",
    text: "Your treatment has been activated and your baseline has been recorded. We'll use your upcoming check-ins and progress photos to track how your plan is performing over time."
  },
  week_6: {
    title: "How your plan is going",
    text: "You've stayed consistent with treatment and haven't reported significant side effects. Early signals suggest your current plan is moving in the right direction. Continue with your routine for now."
  },
  month_3: {
    title: "How your plan is going",
    text: "Three months of consistency are beginning to show results. Your scalp is responding positively to treatment, and your current path still appears appropriate."
  },
  month_6: {
    title: "How your plan is going",
    text: "Six months completed. Your adherence has remained strong, your safety profile is stable, and your results are within the expected range for this treatment."
  }
}

export function EditorialSummary({ journeyState }: EditorialSummaryProps) {
  const content = summaryContent[journeyState]
  
  return (
    <section className="rounded-2xl bg-[#FFFCF8] p-8">
      <h3 className="mb-4 font-mono text-xs font-medium uppercase tracking-wide text-[#9A948C]">
        {content.title}
      </h3>
      <p className="font-mono text-base leading-relaxed text-[#161616] text-pretty">
        {content.text}
      </p>
    </section>
  )
}
