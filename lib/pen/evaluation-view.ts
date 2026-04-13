import type { PenEvaluationAdapter } from "./contracts"

export interface EvaluationTraceRow {
  label: string
  value: string
  reason?: string
}

export interface EvaluationViewModel {
  decisionPath: string
  decisionTitle: string
  decisionExplanation: string
  traceRows: EvaluationTraceRow[]
}

const humanizeLabel = (value: string): string =>
  value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase())

const normalizeReason = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const formatEvidenceValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    const items = value
      .map((entry) => formatEvidenceValue(entry))
      .filter((entry) => entry !== "—")

    return items.length > 0 ? items.join(", ") : "—"
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No"
  }

  if (value === null || value === undefined || value === "") {
    return "—"
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value)
  }

  if (typeof value === "object") {
    const printable = Object.entries(value as Record<string, unknown>)
      .map(([key, nestedValue]) => {
        const formatted = formatEvidenceValue(nestedValue)
        if (formatted === "—") {
          return null
        }

        return `${humanizeLabel(key)}: ${formatted}`
      })
      .filter((entry): entry is string => entry !== null)

    return printable.length > 0 ? printable.join(" · ") : "Provided"
  }

  return String(value)
}

function buildTraceRows(evidence: PenEvaluationAdapter["trace_evidence"]): EvaluationTraceRow[] {
  return Object.entries((evidence ?? {}) as Record<string, unknown>).map(([key, rawValue]) => {
    if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
      const structured = rawValue as Record<string, unknown>
      const labelSource =
        typeof structured.field === "string" && structured.field.trim().length > 0 ? structured.field : key
      const valueSource = "value" in structured ? structured.value : rawValue

      return {
        label: humanizeLabel(labelSource),
        value: formatEvidenceValue(valueSource),
        reason: normalizeReason(structured.reason),
      }
    }

    return {
      label: humanizeLabel(key),
      value: formatEvidenceValue(rawValue),
    }
  })
}

export function buildEvaluationViewModel(evaluation: PenEvaluationAdapter): EvaluationViewModel {
  return {
    decisionPath: evaluation.decision_path || "pending_review",
    decisionTitle: evaluation.decision_title || "Your treatment plan is ready",
    decisionExplanation:
      evaluation.decision_explanation ||
      "This route was selected from your clinical profile and intake context. Your plan can adapt over time as new data is collected.",
    traceRows: buildTraceRows(evaluation.trace_evidence ?? {})
  }
}
