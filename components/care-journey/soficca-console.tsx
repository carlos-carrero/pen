"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { JourneyState } from "@/app/page"

interface SoficcaConsoleProps {
  journeyState: JourneyState
}

const traceEvidence = {
  patient_age: 29,
  norwood_stage: 3,
  primary_area: ["temples", "crown"],
  main_goal: "improve_density",
  high_blood_pressure: true,
  cardiovascular_conditions: false,
  current_medication: false,
  prior_treatment_use: false,
  treatment_preference: "topical",
  routine_consistency: "very_consistent",
  decision_path: "Topical treatment",
  excluded_option: "Oral treatment",
  safety_reason: "Oral treatment excluded due to high blood pressure"
}

const stateLabels: Record<JourneyState, string> = {
  month_0: "Baseline",
  week_6: "Week 6",
  month_3: "Month 3",
  month_6: "Month 6"
}

export function SoficcaConsole({ journeyState }: SoficcaConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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
              Decision trace
            </span>
            <span className="rounded-md bg-[#F6F1E8] px-2 py-0.5 text-[10px] font-medium text-[#5E7C6B]">
              {stateLabels[journeyState]}
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
            <div className="rounded-xl bg-[#252526] p-5">
              <pre className="overflow-x-auto text-[12px] leading-relaxed">
                <code>
                  <span className="text-[#D4D4D4]">{"{"}</span>
                  {"\n"}
                  <span className="text-[#9CDCFE]">  &quot;patient_age&quot;</span>
                  <span className="text-[#D4D4D4]">: </span>
                  <span className="text-[#B5CEA8]">{traceEvidence.patient_age}</span>
                  <span className="text-[#D4D4D4]">,</span>
                  {"\n"}
                  <span className="text-[#9CDCFE]">  &quot;norwood_stage&quot;</span>
                  <span className="text-[#D4D4D4]">: </span>
                  <span className="text-[#B5CEA8]">{traceEvidence.norwood_stage}</span>
                  <span className="text-[#D4D4D4]">,</span>
                  {"\n"}
                  <span className="text-[#9CDCFE]">  &quot;primary_area&quot;</span>
                  <span className="text-[#D4D4D4]">: </span>
                  <span className="text-[#CE9178]">[&quot;temples&quot;, &quot;crown&quot;]</span>
                  <span className="text-[#D4D4D4]">,</span>
                  {"\n"}
                  <span className="text-[#9CDCFE]">  &quot;main_goal&quot;</span>
                  <span className="text-[#D4D4D4]">: </span>
                  <span className="text-[#CE9178]">&quot;{traceEvidence.main_goal}&quot;</span>
                  <span className="text-[#D4D4D4]">,</span>
                  {"\n"}
                  <span className="text-[#9CDCFE]">  &quot;high_blood_pressure&quot;</span>
                  <span className="text-[#D4D4D4]">: </span>
                  <span className="text-[#569CD6]">true</span>
                  <span className="text-[#D4D4D4]">,</span>
                  {"\n"}
                  <span className="text-[#9CDCFE]">  &quot;cardiovascular_conditions&quot;</span>
                  <span className="text-[#D4D4D4]">: </span>
                  <span className="text-[#569CD6]">false</span>
                  <span className="text-[#D4D4D4]">,</span>
                  {"\n"}
                  <span className="text-[#9CDCFE]">  &quot;treatment_preference&quot;</span>
                  <span className="text-[#D4D4D4]">: </span>
                  <span className="text-[#CE9178]">&quot;{traceEvidence.treatment_preference}&quot;</span>
                  <span className="text-[#D4D4D4]">,</span>
                  {"\n"}
                  <span className="text-[#9CDCFE]">  &quot;routine_consistency&quot;</span>
                  <span className="text-[#D4D4D4]">: </span>
                  <span className="text-[#CE9178]">&quot;{traceEvidence.routine_consistency}&quot;</span>
                  <span className="text-[#D4D4D4]">,</span>
                  {"\n"}
                  <span className="text-[#9CDCFE]">  &quot;decision_path&quot;</span>
                  <span className="text-[#D4D4D4]">: </span>
                  <span className="text-[#CE9178]">&quot;{traceEvidence.decision_path}&quot;</span>
                  <span className="text-[#D4D4D4]">,</span>
                  {"\n"}
                  <span className="text-[#9CDCFE]">  &quot;excluded_option&quot;</span>
                  <span className="text-[#D4D4D4]">: </span>
                  <span className="text-[#CE9178]">&quot;{traceEvidence.excluded_option}&quot;</span>
                  <span className="text-[#D4D4D4]">,</span>
                  {"\n"}
                  <span className="text-[#9CDCFE]">  &quot;safety_reason&quot;</span>
                  <span className="text-[#D4D4D4]">: </span>
                  <span className="text-[#CE9178]">&quot;{traceEvidence.safety_reason}&quot;</span>
                  {"\n"}
                  <span className="text-[#D4D4D4]">{"}"}</span>
                </code>
              </pre>
            </div>
            <p className="mt-4 font-sans text-[11px] leading-relaxed text-[#9A948C]">
              Confirmed patient inputs only. Empty fields omitted under zero-noise policy.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
