import type { PenEvaluationAdapter } from "./contracts"

export interface EvaluationViewModel {
  decisionPath: string
  decisionTitle: string
  decisionExplanation: string
  traceEvidence: PenEvaluationAdapter["trace_evidence"]
}

export function buildEvaluationViewModel(evaluation: PenEvaluationAdapter): EvaluationViewModel {
  return {
    decisionPath: evaluation.decision_path || "pending_review",
    decisionTitle: evaluation.decision_title || "Your treatment plan is ready",
    decisionExplanation:
      evaluation.decision_explanation ||
      "This route was selected from your clinical profile and intake context. Your plan can adapt over time as new data is collected.",
    traceEvidence: evaluation.trace_evidence ?? {}
  }
}
