export type PenJourneyStateKey = "month_0" | "week_6" | "month_3" | "month_6"

export interface PenStructuredTraceEvidence {
  field?: string
  value?: unknown
  reason?: string
}

export type PenTraceEvidenceValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | boolean[]
  | PenStructuredTraceEvidence
export type PenTraceEvidence = Record<string, PenTraceEvidenceValue>

export interface PenEvaluateRequest {
  age: number | null
  norwood_stage: number | null
  loss_noticed: string | null
  loss_areas: string[]
  main_goal: string | null
  high_blood_pressure: boolean | null
  cardiovascular_conditions: boolean | null
  current_medication: boolean | null
  medication_detail: string | null
  prior_treatment_use: boolean | null
  which_treatment: string | null
  had_side_effects: boolean | null
  side_effect_detail: string | null
  scalp_sensitivities: boolean | null
  scalp_detail: string | null
  treatment_preference: string | null
  routine_consistency: string | null
  priority_factor: string | null
  baseline_photos_uploaded: boolean
}

export interface PenEvaluationAdapter {
  decision_path: string
  decision_title: string
  decision_explanation: string
  trace_evidence: PenTraceEvidence
}

export interface PenJourneyStateView {
  hero: {
    title: string
    subtitle: string
    start_date: string
    next_review: string
    active_plan_label: string
  }
  progress_strip: {
    items: Array<{
      label: string
      value: string
      icon: "activity" | "calendar" | "trending" | "check" | "camera" | "target"
    }>
  }
  progress_photos: {
    steps: Array<{
      id: string
      label: string
      unlocked: boolean
    }>
  }
  narrative: {
    title: string
    text: string
  }
  recommendation: {
    show: boolean
    product?: string
    description?: string
    icon?: "droplets" | "sparkles" | "package" | "leaf"
  }
  decision_trace_badge: {
    label: string
    state_label: string
    trace_evidence: PenTraceEvidence
  }
}

export type PenJourneyAdapter = Record<PenJourneyStateKey, PenJourneyStateView>

export interface PenFrontendAdapter {
  evaluation: PenEvaluationAdapter
  journey: PenJourneyAdapter
}

export interface PenEvaluateResponse {
  versions: Record<string, string>
  decision: Record<string, unknown>
  trace: Record<string, unknown>
  journey_views: Record<string, unknown>
  frontend_adapter: PenFrontendAdapter
}
