import test from "node:test"
import assert from "node:assert/strict"
import { canonicalDemoIntakeData, canonicalDemoEvaluateResponse } from "../lib/pen/demo-fixture"
import { mapIntakeToPenEvaluateRequest } from "../lib/pen/mapper"
import {
  getBranchSnapshotFromIntake,
  getBranchSnapshotFromRequest,
  getBranchSnapshotFromTrace,
} from "../lib/pen/payload-debug"
import type { IntakeData } from "../components/intake/intake-flow"
import type { PenEvaluateResponse } from "../lib/pen/contracts"

interface Scenario {
  name: string
  updates: Partial<IntakeData>
  expectedRequest: Record<string, unknown>
}

const scenarios: Scenario[] = [
  {
    name: "canonical hypertension case",
    updates: {},
    expectedRequest: {
      cardiovascular_conditions: false,
      prior_treatment_use: false,
      had_side_effects: false,
      scalp_sensitivities: false,
      routine_consistency: "very_consistent",
      priority_factor: "safety",
      treatment_preference: "topical",
    },
  },
  {
    name: "cardiovascular conditions true",
    updates: { cardiovascular: true },
    expectedRequest: { cardiovascular_conditions: true },
  },
  {
    name: "prior treatment true with side effects true",
    updates: { usedTreatmentBefore: true, whichTreatment: "Finasteride", hadSideEffects: true },
    expectedRequest: { prior_treatment_use: true, had_side_effects: true },
  },
  {
    name: "scalp sensitivities true",
    updates: { scalpSensitivities: true, scalpDetail: "Reactive scalp" },
    expectedRequest: { scalp_sensitivities: true },
  },
  {
    name: "simpler consistency preference",
    updates: { consistencyLevel: "simpler" },
    expectedRequest: { routine_consistency: "prefers_simpler_routine" },
  },
  {
    name: "comfort/convenience priority",
    updates: { priorityFactor: "convenience" },
    expectedRequest: { priority_factor: "convenience" },
  },
  {
    name: "unknown critical values where UI allows nulls",
    updates: { usedTreatmentBefore: null, hadSideEffects: null, scalpSensitivities: null },
    expectedRequest: { prior_treatment_use: null, had_side_effects: null, scalp_sensitivities: null },
  },
  {
    name: "oral preference with strong consistency",
    updates: { treatmentPreference: "oral", consistencyLevel: "very" },
    expectedRequest: { treatment_preference: "oral", routine_consistency: "very_consistent" },
  },
]

test("payload fidelity matrix preserves branch-driving variation from intake to request", () => {
  for (const scenario of scenarios) {
    const intake = { ...canonicalDemoIntakeData, ...scenario.updates }
    const request = mapIntakeToPenEvaluateRequest(intake)
    const snapshot = getBranchSnapshotFromRequest(request)

    for (const [field, expected] of Object.entries(scenario.expectedRequest)) {
      assert.equal(
        snapshot[field as keyof typeof snapshot],
        expected,
        `scenario '${scenario.name}' expected ${field} to map to ${String(expected)}`
      )
    }
  }
})

test("branch snapshot helper reads intake and request shapes consistently", () => {
  const intake = { ...canonicalDemoIntakeData, cardiovascular: true, treatmentPreference: "oral" }
  const request = mapIntakeToPenEvaluateRequest(intake)

  assert.equal(getBranchSnapshotFromIntake(intake).cardiovascular_conditions, true)
  assert.equal(getBranchSnapshotFromIntake(intake).treatment_preference, "oral")
  assert.equal(getBranchSnapshotFromRequest(request).cardiovascular_conditions, true)
  assert.equal(getBranchSnapshotFromRequest(request).treatment_preference, "oral")
})

test("branch snapshot helper reads evaluation trace evidence aliases", () => {
  const response = {
    ...canonicalDemoEvaluateResponse,
    frontend_adapter: {
      ...canonicalDemoEvaluateResponse.frontend_adapter,
      evaluation: {
        ...canonicalDemoEvaluateResponse.frontend_adapter.evaluation,
        trace_evidence: {
          cardiovascular_conditions: false,
          used_treatment_before: true,
          experienced_side_effects: true,
          scalp_sensitivity: false,
          routine_consistency: "mostly_consistent",
          priority_factor: "convenience",
          treatment_preference: "oral",
        },
      },
    },
  } as unknown as PenEvaluateResponse

  const trace = getBranchSnapshotFromTrace(response)

  assert.equal(trace.cardiovascular_conditions, false)
  assert.equal(trace.prior_treatment_use, true)
  assert.equal(trace.had_side_effects, true)
  assert.equal(trace.scalp_sensitivities, false)
  assert.equal(trace.routine_consistency, "mostly_consistent")
  assert.equal(trace.priority_factor, "convenience")
  assert.equal(trace.treatment_preference, "oral")
})
