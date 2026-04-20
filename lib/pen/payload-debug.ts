import type { IntakeData } from "../../components/intake/intake-flow"
import type { PenEvaluateRequest, PenEvaluateResponse, PenTraceEvidence } from "./contracts"

export const BRANCH_DRIVING_FIELDS = [
  "high_blood_pressure",
  "cardiovascular_conditions",
  "prior_treatment_use",
  "had_side_effects",
  "scalp_sensitivities",
  "routine_consistency",
  "priority_factor",
  "treatment_preference",
] as const

type BranchDrivingField = (typeof BRANCH_DRIVING_FIELDS)[number]

const TRACE_FIELD_ALIASES: Partial<Record<BranchDrivingField, string[]>> = {
  prior_treatment_use: ["used_treatment_before"],
  had_side_effects: ["experienced_side_effects"],
  scalp_sensitivities: ["scalp_sensitivity"],
}

type BranchSnapshot = Record<BranchDrivingField, unknown>

export function getBranchSnapshotFromIntake(data: IntakeData): BranchSnapshot {
  return {
    high_blood_pressure: data.highBloodPressure,
    cardiovascular_conditions: data.cardiovascular,
    prior_treatment_use: data.usedTreatmentBefore,
    had_side_effects: data.hadSideEffects,
    scalp_sensitivities: data.scalpSensitivities,
    routine_consistency: data.consistencyLevel,
    priority_factor: data.priorityFactor,
    treatment_preference: data.treatmentPreference,
  }
}

export function getBranchSnapshotFromRequest(request: PenEvaluateRequest): BranchSnapshot {
  return {
    high_blood_pressure: request.high_blood_pressure,
    cardiovascular_conditions: request.cardiovascular_conditions,
    prior_treatment_use: request.prior_treatment_use,
    had_side_effects: request.had_side_effects,
    scalp_sensitivities: request.scalp_sensitivities,
    routine_consistency: request.routine_consistency,
    priority_factor: request.priority_factor,
    treatment_preference: request.treatment_preference,
  }
}

function readTraceValue(trace: PenTraceEvidence | undefined, field: BranchDrivingField): unknown {
  if (!trace) {
    return undefined
  }

  if (field in trace) {
    return trace[field]
  }

  const aliases = TRACE_FIELD_ALIASES[field] ?? []
  for (const alias of aliases) {
    if (alias in trace) {
      return trace[alias]
    }
  }

  return undefined
}

export function getBranchSnapshotFromTrace(response: PenEvaluateResponse): BranchSnapshot {
  const trace = response.frontend_adapter?.evaluation?.trace_evidence

  return {
    high_blood_pressure: readTraceValue(trace, "high_blood_pressure"),
    cardiovascular_conditions: readTraceValue(trace, "cardiovascular_conditions"),
    prior_treatment_use: readTraceValue(trace, "prior_treatment_use"),
    had_side_effects: readTraceValue(trace, "had_side_effects"),
    scalp_sensitivities: readTraceValue(trace, "scalp_sensitivities"),
    routine_consistency: readTraceValue(trace, "routine_consistency"),
    priority_factor: readTraceValue(trace, "priority_factor"),
    treatment_preference: readTraceValue(trace, "treatment_preference"),
  }
}
