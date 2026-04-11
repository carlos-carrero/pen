"use client"

import { Camera, Check } from "lucide-react"
import type { JourneyState } from "@/app/page"

interface PhotoTimelineProps {
  journeyState: JourneyState
}

const timelineSteps = [
  { id: "baseline", label: "Baseline", unlockAt: "month_0" },
  { id: "week_6", label: "Week 6", unlockAt: "week_6" },
  { id: "month_3", label: "Month 3", unlockAt: "month_3" },
  { id: "month_6", label: "Month 6", unlockAt: "month_6" }
]

const stateOrder: JourneyState[] = ["month_0", "week_6", "month_3", "month_6"]

function isUnlocked(stepUnlockAt: string, currentState: JourneyState): boolean {
  const stepIndex = stateOrder.indexOf(stepUnlockAt as JourneyState)
  const currentIndex = stateOrder.indexOf(currentState)
  return currentIndex >= stepIndex
}

export function PhotoTimeline({ journeyState }: PhotoTimelineProps) {
  return (
    <section className="rounded-2xl bg-[#FFFCF8] p-6">
      <h3 className="mb-6 font-mono text-xs font-medium uppercase tracking-wide text-[#9A948C]">
        Progress photos
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {timelineSteps.map((step) => {
          const unlocked = isUnlocked(step.unlockAt, journeyState)
          return (
            <div key={step.id} className="flex flex-col gap-2">
              <div
                className={`relative aspect-square rounded-xl transition-all duration-300 ${
                  unlocked
                    ? "bg-[#E8E2D9]"
                    : "border border-dashed border-[#D9D2C7] bg-[#FAF7F2]"
                }`}
              >
                {unlocked ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2F5D50]">
                      <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <Camera className="h-5 w-5 text-[#C9C2B7]" />
                    <span className="font-mono text-[10px] text-[#C9C2B7]">Pending</span>
                  </div>
                )}
              </div>
              <span
                className={`text-center font-sans text-xs ${
                  unlocked ? "font-medium text-[#161616]" : "text-[#9A948C]"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
