import type { IntakeData } from "../../components/intake/intake-flow"
import type { PenEvaluateRequest } from "./contracts"

const normalizeString = (value: string): string | null => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const parseAge = (value: string): number | null => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function mapIntakeToPenEvaluateRequest(data: IntakeData): PenEvaluateRequest {
  return {
    age: parseAge(data.age),
    norwood_stage: data.norwoodStage || null,
    loss_noticed: normalizeString(data.lossNoticed),
    loss_areas: data.lossAreas,
    main_goal: normalizeString(data.mainGoal),
    high_blood_pressure: data.highBloodPressure,
    cardiovascular_conditions: data.cardiovascular,
    current_medication: data.currentMedication,
    medication_detail: normalizeString(data.medicationDetail),
    prior_treatment_use: data.usedTreatmentBefore,
    which_treatment: normalizeString(data.whichTreatment),
    had_side_effects: data.hadSideEffects,
    side_effect_detail: normalizeString(data.sideEffectDetail),
    scalp_sensitivities: data.scalpSensitivities,
    scalp_detail: normalizeString(data.scalpDetail),
    treatment_preference: normalizeString(data.treatmentPreference),
    routine_consistency: normalizeString(data.consistencyLevel),
    priority_factor: normalizeString(data.priorityFactor),
    baseline_photos_uploaded: data.photosUploaded,
  }
}
