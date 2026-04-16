"use client"

import { useEffect, useMemo, useState } from "react"
import { IntakeFlow, type IntakeData } from "@/components/intake/intake-flow"
import { EvaluationScreen } from "@/components/evaluation/evaluation-screen"
import { HeroSection } from "@/components/care-journey/hero-section"
import { ProgressStrip } from "@/components/care-journey/progress-strip"
import { PhotoTimeline } from "@/components/care-journey/photo-timeline"
import { EditorialSummary } from "@/components/care-journey/editorial-summary"
import { CuratedUpsell } from "@/components/care-journey/curated-upsell"
import { SoficcaConsole } from "@/components/care-journey/soficca-console"
import { PresenterControl } from "@/components/care-journey/presenter-control"
import type { PenEvaluateResponse, PenJourneyStateKey } from "@/lib/pen/contracts"
import { PenApiError, evaluatePen } from "@/lib/pen/client"
import { mapIntakeToPenEvaluateRequest } from "@/lib/pen/mapper"
import {
  getBranchSnapshotFromIntake,
  getBranchSnapshotFromRequest,
  getBranchSnapshotFromTrace,
} from "@/lib/pen/payload-debug"
import {
  getInitialJourneyState,
  getPostIntakePhase,
  selectEvaluationAdapter,
  selectJourneyStateView,
  selectJourneyViewSource
} from "@/lib/pen/selectors"

export type JourneyState = PenJourneyStateKey
type FlowPhase = "intake" | "evaluation" | "journey"
const PEN_DEBUG_ENABLED = process.env.NEXT_PUBLIC_PEN_DEBUG === "1"

export default function CareJourneyPage() {
  const [phase, setPhase] = useState<FlowPhase>("intake")
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null)
  const [journeyState, setJourneyState] = useState<JourneyState>("month_0")
  const [penResponse, setPenResponse] = useState<PenEvaluateResponse | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [evaluateError, setEvaluateError] = useState<string | null>(null)

  const handleIntakeComplete = async (data: IntakeData) => {
    setIntakeData(data)
    setEvaluateError(null)
    setIsAnalyzing(true)

    try {
      const request = mapIntakeToPenEvaluateRequest(data)
      if (PEN_DEBUG_ENABLED) {
        console.groupCollapsed("[pen-debug] Intake submit payload audit")
        console.log("raw intake branch fields", getBranchSnapshotFromIntake(data))
        console.log("mapped request branch fields", getBranchSnapshotFromRequest(request))
        console.log("mapped request payload", request)
        console.groupEnd()
      }

      const response = await evaluatePen(request)
      if (PEN_DEBUG_ENABLED) {
        console.groupCollapsed("[pen-debug] Evaluate response audit")
        console.log("decision_path", response.frontend_adapter?.evaluation?.decision_path)
        console.log("trace branch fields", getBranchSnapshotFromTrace(response))
        console.log("raw trace evidence", response.frontend_adapter?.evaluation?.trace_evidence)
        console.groupEnd()
      }
      setPenResponse(response)
      setPhase(getPostIntakePhase())
    } catch (error) {
      setPenResponse(null)
      if (error instanceof PenApiError) {
        setEvaluateError("We couldn't complete your evaluation right now. Please try again.")
        console.error(error.message)
      } else {
        setEvaluateError("Something went wrong while evaluating your profile. Please try again.")
        console.error("Unexpected error while evaluating intake", error)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleEvaluationContinue = () => {
    setPhase("journey")
    setJourneyState(getInitialJourneyState())
  }

  const evaluationAdapter = useMemo(() => selectEvaluationAdapter(penResponse), [penResponse])
  const journeyView = useMemo(
    () => selectJourneyStateView(penResponse, journeyState),
    [penResponse, journeyState]
  )
  const journeyViewSource = useMemo(
    () => selectJourneyViewSource(penResponse, journeyState),
    [penResponse, journeyState]
  )

  useEffect(() => {
    if (!PEN_DEBUG_ENABLED || phase !== "journey") {
      return
    }

    console.debug("[pen-debug] journey source", {
      journey_state: journeyState,
      source: journeyViewSource,
      trace_keys: Object.keys(journeyView.decision_trace_badge.trace_evidence ?? {}),
    })
  }, [phase, journeyState, journeyViewSource, journeyView])

  if (phase === "intake") {
    return (
      <main className="min-h-screen bg-[#F6F1E8]">
        <IntakeFlow
          onComplete={handleIntakeComplete}
          isSubmitting={isAnalyzing}
          submitError={evaluateError}
        />
      </main>
    )
  }

  if (phase === "evaluation" && intakeData) {
    return (
      <main className="min-h-screen bg-[#F6F1E8]">
        <EvaluationScreen
          intakeData={intakeData}
          evaluation={evaluationAdapter}
          isAnalyzing={isAnalyzing}
          onContinue={handleEvaluationContinue}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F6F1E8]">
      <div className="mx-auto max-w-2xl px-6 py-12 pb-28">
        <header className="mb-10">
          <h1 className="font-sans text-xl font-semibold tracking-tight text-[#161616]">
            Pen
          </h1>
        </header>

        <div className="flex flex-col gap-6">
          <HeroSection journeyView={journeyView} />
          <ProgressStrip journeyView={journeyView} />
          <PhotoTimeline journeyView={journeyView} />
          <EditorialSummary journeyView={journeyView} />
          <CuratedUpsell journeyView={journeyView} />
        </div>

        <div className="my-12 border-t border-[#E6DED3]/60" />

        <SoficcaConsole journeyView={journeyView} />

        <PresenterControl
          journeyState={journeyState}
          setJourneyState={setJourneyState}
        />
      </div>
    </main>
  )
}
