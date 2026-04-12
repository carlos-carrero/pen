import test from "node:test"
import assert from "node:assert/strict"
import { canonicalDemoEvaluateResponse } from "../lib/pen/demo-fixture"
import { fallbackFrontendAdapter } from "../lib/pen/fallback-adapter"
import {
  getInitialJourneyState,
  getPostIntakePhase,
  selectEvaluationAdapter,
  selectJourneyStateView
} from "../lib/pen/selectors"
import { buildEvaluationViewModel } from "../lib/pen/evaluation-view"

test("selectEvaluationAdapter reads frontend_adapter.evaluation", () => {
  const adapter = selectEvaluationAdapter(canonicalDemoEvaluateResponse)

  assert.equal(adapter.decision_path, canonicalDemoEvaluateResponse.frontend_adapter.evaluation.decision_path)
})

test("selectJourneyStateView reads correct state from frontend_adapter.journey", () => {
  const stateView = selectJourneyStateView(canonicalDemoEvaluateResponse, "week_6")

  assert.equal(stateView.hero.title, canonicalDemoEvaluateResponse.frontend_adapter.journey.week_6.hero.title)
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
