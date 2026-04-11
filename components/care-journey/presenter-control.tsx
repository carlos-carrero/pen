"use client"

import type { JourneyState } from "@/app/page"

interface PresenterControlProps {
  journeyState: JourneyState
  setJourneyState: (state: JourneyState) => void
}

const states: { value: JourneyState; label: string }[] = [
  { value: "month_0", label: "Month 0" },
  { value: "week_6", label: "Week 6" },
  { value: "month_3", label: "Month 3" },
  { value: "month_6", label: "Month 6" }
]

export function PresenterControl({ journeyState, setJourneyState }: PresenterControlProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="flex items-center gap-0.5 rounded-full bg-[#FFFCF8]/95 p-1 shadow-lg ring-1 ring-[#E6DED3] backdrop-blur-sm">
        {states.map((state) => (
          <button
            key={state.value}
            onClick={() => setJourneyState(state.value)}
            className={`rounded-full px-4 py-2 font-sans text-xs font-medium transition-all ${
              journeyState === state.value
                ? "bg-[#2F5D50] text-white"
                : "text-[#5F5A54] hover:bg-[#F6F1E8]"
            }`}
          >
            {state.label}
          </button>
        ))}
      </div>
    </div>
  )
}
