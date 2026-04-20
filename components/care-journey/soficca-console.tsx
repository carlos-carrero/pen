"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { PenJourneyStateView } from "@/lib/pen/contracts"

interface SoficcaConsoleProps {
  journeyView: PenJourneyStateView
}

export function SoficcaConsole({ journeyView }: SoficcaConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const badge = journeyView.decision_trace_badge
  const traceEntries = Object.entries(badge.trace_evidence ?? {})
  const hasTraceEvidence = traceEntries.length > 0

  return (
    <section className="font-mono">
      <div className="mb-6 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-[#5E7C6B]" />
        <span className="font-mono text-xs font-medium uppercase tracking-wide text-[#9A948C]">
          Powered by Soficca
        </span>
      </div>

      <div className="rounded-2xl bg-[#FFFCF8] p-5">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="font-sans text-xs font-medium text-[#5F5A54]">
              {badge.label}
            </span>
            <span className="rounded-md bg-[#F6F1E8] px-2 py-0.5 text-[10px] font-medium text-[#5E7C6B]">
              {badge.state_label}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-[#9A948C]">
            {isExpanded ? "Hide details" : "Show details"}
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </span>
        </button>

        {isExpanded && (
          <div className="mt-5">
            {hasTraceEvidence ? (
              <div className="rounded-xl bg-[#252526] p-5">
                <pre className="overflow-x-auto text-[12px] leading-relaxed text-[#D4D4D4]">
                  <code>{JSON.stringify(badge.trace_evidence, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E6DED3] bg-[#FAF7F2] p-4">
                <p className="font-sans text-xs text-[#5F5A54]">
                  Trace evidence is unavailable for this journey state.
                </p>
              </div>
            )}
            <p className="mt-4 font-sans text-[11px] leading-relaxed text-[#9A948C]">
              Confirmed patient inputs only. Empty fields omitted under zero-noise policy.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
