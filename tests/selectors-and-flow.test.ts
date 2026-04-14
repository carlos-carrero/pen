import test from "node:test"
import assert from "node:assert/strict"
import { canonicalDemoEvaluateResponse } from "../lib/pen/demo-fixture"
import {
  getInitialJourneyState,
  getPostIntakePhase,
  selectEvaluationAdapter,
  selectJourneyStateView
} from "../lib/pen/selectors"
import { buildEvaluationViewModel } from "../lib/pen/evaluation-view"
import type { PenEvaluateResponse } from "../lib/pen/contracts"

test("selectEvaluationAdapter reads frontend_adapter.evaluation", () => {
  const adapter = selectEvaluationAdapter(canonicalDemoEvaluateResponse)

  assert.equal(adapter.decision_path, canonicalDemoEvaluateResponse.frontend_adapter.evaluation.decision_path)
})

test("selectJourneyStateView reads correct state from frontend_adapter.journey", () => {
  const stateView = selectJourneyStateView(canonicalDemoEvaluateResponse, "week_6")

  assert.equal(stateView.hero.title, canonicalDemoEvaluateResponse.frontend_adapter.journey.week_6.hero.title)
})

test("selectJourneyStateView normalizes array-style progress sections from live payload", () => {
  const response = {
    ...canonicalDemoEvaluateResponse,
    frontend_adapter: {
      ...canonicalDemoEvaluateResponse.frontend_adapter,
      journey: {
        ...canonicalDemoEvaluateResponse.frontend_adapter.journey,
        month_0: {
          ...canonicalDemoEvaluateResponse.frontend_adapter.journey.month_0,
          progress_strip: [
            { label: "Plan status", value: "Activated", icon: "check" },
            { label: "Baseline photos", value: "Uploaded", icon: "camera" },
          ],
          progress_photos: [
            { id: "baseline", label: "Baseline", unlocked: true },
            { id: "week_6", label: "Week 6", unlocked: false },
          ],
        },
      },
    },
  } as unknown as PenEvaluateResponse

  const stateView = selectJourneyStateView(response, "month_0")

  assert.equal(Array.isArray(stateView.progress_strip.items), true)
  assert.equal(stateView.progress_strip.items.length, 2)
  assert.equal(stateView.progress_strip.items[0]?.value, "Activated")
  assert.equal(Array.isArray(stateView.progress_photos.steps), true)
  assert.equal(stateView.progress_photos.steps.length, 2)
})

test("selectJourneyStateView falls back on malformed journey sections", () => {
  const response = {
    ...canonicalDemoEvaluateResponse,
    frontend_adapter: {
      ...canonicalDemoEvaluateResponse.frontend_adapter,
      journey: {
        ...canonicalDemoEvaluateResponse.frontend_adapter.journey,
        month_0: {
          ...canonicalDemoEvaluateResponse.frontend_adapter.journey.month_0,
          progress_strip: { items: "invalid" },
          progress_photos: { steps: "invalid" },
        },
      },
    },
  } as unknown as PenEvaluateResponse

  const stateView = selectJourneyStateView(response, "month_0")

  assert.equal(stateView.progress_strip.items.length > 0, true)
  assert.equal(stateView.progress_photos.steps.length > 0, true)
})



test("selectJourneyStateView normalizes hero/narrative/recommendation/badge fields", () => {
  const response = {
    ...canonicalDemoEvaluateResponse,
    frontend_adapter: {
      ...canonicalDemoEvaluateResponse.frontend_adapter,
      journey: {
        ...canonicalDemoEvaluateResponse.frontend_adapter.journey,
        month_0: {
          hero: { title: "Custom title", subtitle: "Sub", start_date: "Now", next_review: "Soon", active_plan_label: "Plan A" },
          progress_strip: [],
          progress_photos: [],
          narrative: { title: "Narrative", text: "Story" },
          recommendation: { show: true, product: "Prod", description: "Desc", icon: "leaf" },
          decision_trace_badge: { label: "Trace", state_label: "M0", trace_evidence: { key: "value" } },
        },
      },
    },
  } as unknown as PenEvaluateResponse

  const stateView = selectJourneyStateView(response, "month_0")

  assert.equal(stateView.hero.title, "Custom title")
  assert.equal(stateView.narrative.title, "Narrative")
  assert.equal(stateView.recommendation.show, true)
  assert.equal(stateView.decision_trace_badge.label, "Trace")
})

test("selectJourneyStateView retains structured trace evidence objects in decision badge", () => {
  const response = {
    ...canonicalDemoEvaluateResponse,
    frontend_adapter: {
      ...canonicalDemoEvaluateResponse.frontend_adapter,
      journey: {
        ...canonicalDemoEvaluateResponse.frontend_adapter.journey,
        month_0: {
          ...canonicalDemoEvaluateResponse.frontend_adapter.journey.month_0,
          decision_trace_badge: {
            label: "Decision trace",
            state_label: "Baseline",
            trace_evidence: {
              oral_gate: { field: "high_blood_pressure", value: true, reason: "Safety gate" },
            },
          },
        },
      },
    },
  } as unknown as PenEvaluateResponse

  const stateView = selectJourneyStateView(response, "month_0")
  const row = stateView.decision_trace_badge.trace_evidence.oral_gate as { reason?: string } | undefined

  assert.equal(row?.reason, "Safety gate")
})

test("buildEvaluationViewModel prioritizes adapter fields", () => {
  const viewModel = buildEvaluationViewModel({
    decision_path: "topical_treatment",
    decision_title: "Your treatment plan is ready",
    decision_explanation: "Topical treatment selected as safest path.",
    trace_evidence: { excluded_option: "Oral treatment" }
  })

  assert.equal(viewModel.decisionTitle, "Your treatment plan is ready")
  assert.equal(viewModel.decisionPath, "topical_treatment")
  assert.equal(viewModel.traceRows[0]?.label, "Excluded Option")
  assert.equal(viewModel.traceRows[0]?.displayValue, "Oral Treatment")
})

test("buildEvaluationViewModel normalizes structured trace evidence objects for readable rows", () => {
  const viewModel = buildEvaluationViewModel({
    decision_path: "topical_treatment",
    decision_title: "Title",
    decision_explanation: "Explanation",
    trace_evidence: {} as Record<string, never>,
  })

  const structured = buildEvaluationViewModel({
    decision_path: "topical_treatment",
    decision_title: "Title",
    decision_explanation: "Explanation",
    trace_evidence: {
      blood_pressure_gate: {
        field: "high_blood_pressure",
        value: true,
        reason: "Oral treatment excluded due to high blood pressure",
      },
      loss_areas: ["Temples", "Crown"],
    },
  })

  const row = structured.traceRows.find((entry) => entry.label === "High blood pressure")

  assert.equal(viewModel.traceRows.length, 0)
  assert.equal(row?.displayValue, "Yes")
  assert.equal(row?.reason, "Oral treatment excluded due to high blood pressure")
  assert.equal(structured.traceRows.find((entry) => entry.label === "Loss Areas")?.displayValue, "Temples, Crown")
  assert.equal(structured.traceRows.some((entry) => entry.displayValue.includes("[object Object]")), false)
})

test("buildEvaluationViewModel prioritizes meaningful rows and humanizes enum values", () => {
  const viewModel = buildEvaluationViewModel({
    decision_path: "topical_treatment",
    decision_title: "Title",
    decision_explanation: "",
    trace_evidence: {
      random_signal: "engine_state",
      treatment_preference: "topical",
      routine_consistency: "very_consistent",
      priority_factor: "safety",
      high_blood_pressure: true,
      excluded_option: "oral treatment",
      prior_treatment_use: false,
    },
  })

  assert.equal(viewModel.traceRows.length, 4)
  assert.equal(viewModel.traceRows[0]?.label, "High blood pressure")
  assert.equal(viewModel.traceRows[0]?.displayValue, "Yes")
  assert.equal(viewModel.traceRows[1]?.label, "Preferred format")
  assert.equal(viewModel.traceRows[1]?.displayValue, "Topical")
  assert.equal(viewModel.traceRows[2]?.label, "Daily routine consistency")
  assert.equal(viewModel.traceRows[2]?.displayValue, "Strong")
  assert.equal(viewModel.traceRows[3]?.label, "Top priority")
  assert.equal(viewModel.traceRows[3]?.displayValue, "Safety")
  assert.equal(viewModel.traceRows.some((entry) => entry.label === "Excluded Option"), false)
})

test("buildEvaluationViewModel generates user-facing safety explanation when key evidence is present", () => {
  const viewModel = buildEvaluationViewModel({
    decision_path: "topical_treatment",
    decision_title: "Title",
    decision_explanation: "technical explanation",
    trace_evidence: {
      high_blood_pressure: true,
      excluded_option: "oral treatment",
      treatment_preference: "topical",
    },
  })

  assert.match(viewModel.decisionExplanation, /excluded for safety/)
  assert.match(viewModel.decisionExplanation, /safest place to start/)
})

test("buildEvaluationViewModel maps string booleans and rewrites technical reason text", () => {
  const viewModel = buildEvaluationViewModel({
    decision_path: "topical_treatment",
    decision_title: "Title",
    decision_explanation: "",
    trace_evidence: {
      high_blood_pressure: {
        field: "high_blood_pressure",
        value: "true",
        reason: "Explicitly provided by intake payload.",
      },
      prior_treatment_use: {
        field: "prior_treatment_use",
        value: "false",
        reason: "Used for deterministic side-effect safety branching.",
      },
    },
  })

  assert.equal(viewModel.traceRows[0]?.displayValue, "Yes")
  assert.equal(viewModel.traceRows[0]?.reason, "You reported this in your intake.")
  assert.equal(viewModel.traceRows[1]?.displayValue, "No")
  assert.equal(viewModel.traceRows[1]?.reason, "This helps us keep your starting plan safety-first.")
})

test("flow transition helpers preserve intake->evaluation->journey start", () => {
  assert.equal(getPostIntakePhase(), "evaluation")
  assert.equal(getInitialJourneyState(), "month_0")
})
