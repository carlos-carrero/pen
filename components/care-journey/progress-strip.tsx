"use client"

import { Activity, CalendarCheck, TrendingUp, CheckCircle2, Camera, Target } from "lucide-react"
import type { JourneyState } from "@/app/page"

interface ProgressStripProps {
  journeyState: JourneyState
}

const progressContent: Record<JourneyState, {
  items: {
    label: string
    value: string
    icon: "activity" | "calendar" | "trending" | "check" | "camera" | "target"
  }[]
}> = {
  month_0: {
    items: [
      { label: "Plan status", value: "Activated", icon: "check" },
      { label: "Baseline photos", value: "Uploaded", icon: "camera" },
      { label: "Next milestone", value: "Week 6 check-in", icon: "target" }
    ]
  },
  week_6: {
    items: [
      { label: "Consistency", value: "Strong this month", icon: "activity" },
      { label: "Latest update", value: "Week 6 check-in", icon: "calendar" },
      { label: "Progress", value: "Early stabilization", icon: "trending" }
    ]
  },
  month_3: {
    items: [
      { label: "Consistency", value: "Excellent", icon: "activity" },
      { label: "Latest update", value: "Month 3 review", icon: "calendar" },
      { label: "Progress", value: "Visible response", icon: "trending" }
    ]
  },
  month_6: {
    items: [
      { label: "Consistency", value: "Consistent", icon: "activity" },
      { label: "Latest update", value: "Month 6 evaluation", icon: "calendar" },
      { label: "Progress", value: "Sustained results", icon: "trending" }
    ]
  }
}

const iconMap = {
  activity: Activity,
  calendar: CalendarCheck,
  trending: TrendingUp,
  check: CheckCircle2,
  camera: Camera,
  target: Target
}

export function ProgressStrip({ journeyState }: ProgressStripProps) {
  const content = progressContent[journeyState]

  return (
    <section className="rounded-2xl bg-[#FFFCF8] p-6">
      <div className="grid grid-cols-3 gap-4">
        {content.items.map((item, index) => {
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
