import type { PenEvaluationAdapter } from "./contracts"

export interface EvaluationViewModel {
  decisionPath: string
  decisionTitle: string
  decisionExplanation: string
  traceEvidence: PenEvaluationAdapter["trace_evidence"]
}

const normalizeTraceValue = (value: unknown): string | number | boolean | null | string[] => {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((entry) => {
      if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
        return String(entry)
      }

      return JSON.stringify(entry)
    })
  }

  return JSON.stringify(value)
}

function normalizeTraceEvidence(evidence: PenEvaluationAdapter["trace_evidence"]): PenEvaluationAdapter["trace_evidence"] {
  return Object.fromEntries(
    Object.entries(evidence ?? {}).map(([key, value]) => [key, normalizeTraceValue(value)])
  )
}

export function buildEvaluationViewModel(evaluation: PenEvaluationAdapter): EvaluationViewModel {
  return {
    decisionPath: evaluation.decision_path || "pending_review",
    decisionTitle: evaluation.decision_title || "Your treatment plan is ready",
    decisionExplanation:
      evaluation.decision_explanation ||
      "This route was selected from your clinical profile and intake context. Your plan can adapt over time as new data is collected.",
    traceEvidence: normalizeTraceEvidence(evaluation.trace_evidence ?? {})
  }
}
