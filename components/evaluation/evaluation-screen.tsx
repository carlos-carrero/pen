"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import type { IntakeData } from "@/components/intake/intake-flow"

interface EvaluationScreenProps {
  intakeData: IntakeData
  onContinue: () => void
}

export function EvaluationScreen({ intakeData, onContinue }: EvaluationScreenProps) {
  const [phase, setPhase] = useState<"reviewing" | "ready">("reviewing")

  // Simulate evaluation delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("ready")
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  // Determine if oral should be excluded (for demo: exclude if high blood pressure or cardiovascular)
  const oralExcluded = intakeData.highBloodPressure || intakeData.cardiovascular

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
                {"We're using your intake and health information to determine the safest starting path."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-sans text-xl font-semibold text-[#161616]">
                Your starting plan is ready
              </h2>
            </div>

            <div className="rounded-xl border border-[#E6DED3] bg-[#FAF7F2] p-5">
              <p className="font-sans text-sm leading-relaxed text-[#161616]">
                {oralExcluded
                  ? "Oral treatment was excluded based on your health profile. Topical treatment has been selected as your safest starting path."
                  : "Based on your preferences and health profile, topical treatment has been selected as your recommended starting path."
                }
              </p>
            </div>

            {/* Decision Summary */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#E6DED3] pb-3">
                <span className="font-mono text-xs text-[#9A948C]">Selected path</span>
                <span className="font-sans text-sm font-medium text-[#2F5D50]">Topical treatment</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E6DED3] pb-3">
                <span className="font-mono text-xs text-[#9A948C]">Norwood stage</span>
                <span className="font-sans text-sm text-[#5F5A54]">{intakeData.norwoodStage}</span>
              </div>
              {oralExcluded && (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#9A948C]">Safety consideration</span>
                  <span className="font-sans text-sm text-[#5F5A54]">High blood pressure</span>
                </div>
              )}
            </div>

            <button
              onClick={onContinue}
              className="mt-4 w-full rounded-lg bg-[#2F5D50] px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-[#264A40]"
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
