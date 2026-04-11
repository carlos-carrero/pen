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
  const [engineDecision, setEngineDecision] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleIntakeComplete = async (data: IntakeData) => {
    setIntakeData(data)
    setIsAnalyzing(true)

    try {
      const comorbidities: string[] = []

      if (data.highBloodPressure) {
        comorbidities.push("hypertension")
      }

      if (data.cardiovascular) {
        comorbidities.push("cardiovascular_disease")
      }

      const payload = {
        age: Number(data.age) || 29,
        norwood_stage: data.norwoodStage || 3,
        comorbidities: comorbidities.length > 0 ? comorbidities : ["hypertension"]
      }

      const response = await fetch("http://localhost:8000/api/v1/dermatology/hairloss/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Evaluation request failed with status ${response.status}`)
      }

      const decision = await response.json()
      setEngineDecision(decision)
    } catch (error) {
      console.error("Failed to retrieve Soficca decision", error)
      setEngineDecision({
        decision_path: "fallback_topical",
        trace_evidence: {
          age: Number(data.age) || 29,
          norwood_stage: data.norwoodStage || 3,
          comorbidities: ["hypertension"],
          note: "Backend unavailable. Showing safe fallback decision for demo."
        }
      })
    } finally {
      setIsAnalyzing(false)
      setPhase("evaluation")
    }
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
          engineDecision={engineDecision}
          isAnalyzing={isAnalyzing}
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
