"use client"

import { useState } from "react"
import { IntakeFlow, type IntakeData } from "@/components/intake/intake-flow"
import { EvaluationScreen } from "@/components/evaluation/evaluation-screen"
import { HeroSection } from "@/components/care-journey/hero-section"
import { ProgressStrip } from "@/components/care-journey/progress-strip"
import { PhotoTimeline } from "@/components/care-journey/photo-timeline"
import { EditorialSummary } from "@/components/care-journey/editorial-summary"
import { CuratedUpsell } from "@/components/care-journey/curated-upsell"
import { SoficcaConsole } from "@/components/care-journey/soficca-console"
import { PresenterControl } from "@/components/care-journey/presenter-control"
export type JourneyState = "month_0" | "week_6" | "month_3" | "month_6"
type FlowPhase = "intake" | "evaluation" | "journey"

export default function CareJourneyPage() {
  const [phase, setPhase] = useState<FlowPhase>("intake")
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null)
  const [journeyState, setJourneyState] = useState<JourneyState>("month_0")

  const handleIntakeComplete = (data: IntakeData) => {
    setIntakeData(data)
    setPhase("evaluation")
  }

  const handleEvaluationContinue = () => {
    setPhase("journey")
    setJourneyState("month_0")
  }

  // Intake flow
  if (phase === "intake") {
    return (
      <main className="min-h-screen bg-[#F6F1E8]">
        <IntakeFlow onComplete={handleIntakeComplete} />
      </main>
    )
  }

  // Evaluation screen
  if (phase === "evaluation" && intakeData) {
    return (
      <main className="min-h-screen bg-[#F6F1E8]">
        <EvaluationScreen 
          intakeData={intakeData} 
          onContinue={handleEvaluationContinue} 
        />
      </main>
    )
  }

  // Care journey screens
  return (
    <main className="min-h-screen bg-[#F6F1E8]">
      <div className="mx-auto max-w-2xl px-6 py-12 pb-28">
        {/* Pen Logo/Header */}
        <header className="mb-10">
          <h1 className="font-sans text-xl font-semibold tracking-tight text-[#161616]">
            Pen
          </h1>
        </header>

        {/* Front-Stage UI - Care Journey Screen */}
        <div className="flex flex-col gap-6">
          <HeroSection journeyState={journeyState} />
          <ProgressStrip journeyState={journeyState} />
          <PhotoTimeline journeyState={journeyState} />
          <EditorialSummary journeyState={journeyState} />
          <CuratedUpsell journeyState={journeyState} />
        </div>

        {/* Subtle Divider */}
        <div className="my-12 border-t border-[#E6DED3]/60" />

        {/* Back-Stage UI - Soficca */}
        <SoficcaConsole journeyState={journeyState} />

        {/* State Switcher - only visible on Week 6 / Month 3 / Month 6 */}
        <PresenterControl 
          journeyState={journeyState} 
          setJourneyState={setJourneyState} 
        />
      </div>
    </main>
  )
}
