import type { IntakeData } from "../../components/intake/intake-flow"
import type { PenEvaluateRequest, PenEvaluateResponse } from "./contracts"
import { fallbackFrontendAdapter } from "./fallback-adapter"

export const canonicalDemoIntakeData: IntakeData = {
  age: "29",
  norwoodStage: 3,
  lossNoticed: "1-3 years",
  lossAreas: ["Temples", "Crown"],
  mainGoal: "Improve density",
  highBloodPressure: true,
  cardiovascular: false,
  currentMedication: false,
  medicationDetail: "",
  usedTreatmentBefore: false,
  whichTreatment: "",
  hadSideEffects: null,
  sideEffectDetail: "",
  scalpSensitivities: false,
  scalpDetail: "",
  treatmentPreference: "topical",
  consistencyLevel: "very",
  priorityFactor: "safety",
  photosUploaded: true
}

export const canonicalDemoEvaluateRequest: PenEvaluateRequest = {
  age: 29,
  norwood_stage: 3,
  loss_noticed: "1-3 years",
  loss_areas: ["Temples", "Crown"],
  main_goal: "Improve density",
  high_blood_pressure: true,
  cardiovascular_conditions: false,
  current_medication: false,
  medication_detail: null,
  prior_treatment_use: false,
  which_treatment: null,
  had_side_effects: null,
  side_effect_detail: null,
  scalp_sensitivities: false,
  scalp_detail: null,
  treatment_preference: "topical",
  routine_consistency: "very",
  priority_factor: "safety",
  baseline_photos_uploaded: true
}

export const canonicalDemoEvaluateResponse: PenEvaluateResponse = {
  versions: { api: "v1" },
  decision: {},
  trace: {},
  journey_views: {},
  frontend_adapter: fallbackFrontendAdapter
}
