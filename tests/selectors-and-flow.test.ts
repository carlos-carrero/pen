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

test("buildEvaluationViewModel prioritizes adapter fields", () => {
  const viewModel = buildEvaluationViewModel({
    decision_path: "topical_treatment",
    decision_title: "Your treatment plan is ready",
    decision_explanation: "Topical treatment selected as safest path.",
    trace_evidence: { excluded_option: "Oral treatment" }
  })

  assert.equal(viewModel.decisionTitle, "Your treatment plan is ready")
  assert.equal(viewModel.decisionPath, "topical_treatment")
})

test("flow transition helpers preserve intake->evaluation->journey start", () => {
  assert.equal(getPostIntakePhase(), "evaluation")
  assert.equal(getInitialJourneyState(), "month_0")
})
