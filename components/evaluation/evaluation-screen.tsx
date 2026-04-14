"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import type { IntakeData } from "@/components/intake/intake-flow"
import type { PenEvaluationAdapter } from "@/lib/pen/contracts"
import { buildEvaluationViewModel } from "@/lib/pen/evaluation-view"

interface EvaluationScreenProps {
  intakeData: IntakeData
  evaluation: PenEvaluationAdapter
  isAnalyzing?: boolean
  onContinue: () => void
}

const formatDecisionPath = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

export function EvaluationScreen({
  intakeData,
  evaluation,
  isAnalyzing = false,
  onContinue
}: EvaluationScreenProps) {
  const [phase, setPhase] = useState<"reviewing" | "ready">("reviewing")

  const viewModel = useMemo(() => buildEvaluationViewModel(evaluation), [evaluation])
  const hasEvidence = viewModel.traceRows.length > 0

  useEffect(() => {
    if (isAnalyzing) {
      setPhase("reviewing")
      return
    }

    const timer = setTimeout(() => {
      setPhase("ready")
    }, 800)

    return () => clearTimeout(timer)
  }, [isAnalyzing, evaluation])

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-sans text-xl font-semibold tracking-tight text-[#161616]">
          Pen
        </h1>
      </header>

      <div className="rounded-2xl bg-[#FFFCF8] p-8">
        {phase === "reviewing" ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-[#F6F1E8]" />
              <Loader2 className="absolute inset-0 m-auto h-6 w-6 animate-spin text-[#2F5D50]" />
            </div>
            <div className="text-center">
              <h2 className="font-sans text-xl font-semibold text-[#161616]">
                Reviewing your profile
              </h2>
              <p className="mt-2 font-mono text-sm text-[#5F5A54]">
                {"Soficca is evaluating your intake and safety profile to generate a personalized treatment route."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <h2 className="font-sans text-xl font-semibold text-[#161616]">{viewModel.decisionTitle}</h2>
              <div className="inline-flex items-center rounded-full border border-[#2F5D50]/20 bg-[#2F5D50]/10 px-3 py-1.5">
                <span className="font-mono text-xs uppercase tracking-wide text-[#2F5D50]">
                  Recommended starting plan: {formatDecisionPath(viewModel.decisionPath)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[#E6DED3] bg-[#FAF7F2] p-5">
              <p className="font-sans text-sm leading-relaxed text-[#161616]">{viewModel.decisionExplanation}</p>
            </div>

            {/* Clinical reasoning */}
            <div className="rounded-xl border border-[#E6DED3] bg-white p-5">
              <div className="mb-4 flex items-center justify-between border-b border-[#E6DED3] pb-3">
                <h3 className="font-sans text-sm font-semibold text-[#161616]">
                  Why this plan was selected
                </h3>
                <span className="font-mono text-[11px] uppercase tracking-wide text-[#9A948C]">
                  Soficca reasoning
                </span>
              </div>

              <div className="space-y-3">
                {hasEvidence ? (
                  viewModel.traceRows.map((row) => (
                    <div
                      key={`${row.label}-${row.displayValue}`}
                      className="border-b border-[#F0EAE0] pb-2 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-xs text-[#9A948C]">{row.label}</span>
                        <span className="text-right font-sans text-sm text-[#5F5A54]">{row.displayValue}</span>
                      </div>
                      {row.reason && (
                        <p className="mt-1 font-mono text-[11px] leading-relaxed text-[#9A948C]">{row.reason}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between border-b border-[#F0EAE0] pb-2">
                    <span className="font-mono text-xs text-[#9A948C]">Norwood Stage</span>
                    <span className="font-sans text-sm text-[#5F5A54]">{intakeData.norwoodStage}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onContinue}
              className="mt-2 w-full rounded-lg bg-[#2F5D50] px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-[#264A40]"
            >
              Continue to your plan
            </button>
          </div>
        )}
      </div>

      {/* Powered by Soficca */}
      <div className="mt-10 flex items-center justify-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-[#5E7C6B]" />
        <span className="font-mono text-[11px] text-[#9A948C]">
          Powered by Soficca
        </span>
      </div>
    </div>
  )
}
