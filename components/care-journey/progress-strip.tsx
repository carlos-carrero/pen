"use client"

import { Activity, CalendarCheck, TrendingUp, CheckCircle2, Camera, Target } from "lucide-react"
import type { PenJourneyStateView } from "@/lib/pen/contracts"

interface ProgressStripProps {
  journeyView: PenJourneyStateView
}

const iconMap = {
  activity: Activity,
  calendar: CalendarCheck,
  trending: TrendingUp,
  check: CheckCircle2,
  camera: Camera,
  target: Target
}

export function ProgressStrip({ journeyView }: ProgressStripProps) {
  return (
    <section className="rounded-2xl bg-[#FFFCF8] p-6">
      <div className="grid grid-cols-3 gap-4">
        {journeyView.progress_strip.items.map((item, index) => {
          const IconComponent = iconMap[item.icon]
          return (
            <div key={index} className="flex flex-col gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F1E8]">
                <IconComponent className="h-5 w-5 text-[#2F5D50]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-sans text-base font-semibold text-[#161616] leading-tight">
                  {item.value}
                </span>
                <span className="font-mono text-[11px] text-[#9A948C]">
                  {item.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
