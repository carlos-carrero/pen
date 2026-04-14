import type { PenEvaluationAdapter } from "./contracts"

export interface EvaluationTraceRow {
  label: string
  displayValue: string
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

const LABEL_OVERRIDES: Record<string, string> = {
  high_blood_pressure: "High blood pressure",
  cardiovascular_conditions: "Cardiovascular conditions",
  treatment_preference: "Preferred format",
  routine_consistency: "Daily routine consistency",
  priority_factor: "Top priority",
  prior_treatment_use: "Prior treatment history",
  had_side_effects: "Prior side effects",
}

const VALUE_OVERRIDES: Record<string, Record<string, string>> = {
  routine_consistency: {
    very_consistent: "Strong",
    mostly_consistent: "Mostly consistent",
    prefers_simpler_routine: "Prefers simpler routine",
  },
  treatment_preference: {
    topical: "Topical",
    oral: "Oral",
    either: "Open to either",
  },
  priority_factor: {
    safety: "Safety",
    convenience: "Convenience",
    results: "Visible results",
    maintenance: "Long-term maintenance",
  },
}

const PRIORITY_TRACE_FIELDS = [
  "high_blood_pressure",
  "excluded_option",
  "treatment_preference",
  "routine_consistency",
  "priority_factor",
  "prior_treatment_use",
  "had_side_effects",
]

const MAX_TRACE_ROWS = 5

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
    return humanizeLabel(String(value)).replace(/^./, (char) => char.toUpperCase())
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
  const rows = Object.entries((evidence ?? {}) as Record<string, unknown>).map(([key, rawValue]) => {
    if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
      const structured = rawValue as Record<string, unknown>
      const labelSource =
        typeof structured.field === "string" && structured.field.trim().length > 0 ? structured.field : key
      const valueSource = "value" in structured ? structured.value : rawValue
      const fieldKey = typeof labelSource === "string" ? labelSource : key
      const rawDisplayValue = formatEvidenceValue(valueSource)
      const displayValue =
        typeof valueSource === "string" && VALUE_OVERRIDES[fieldKey]?.[valueSource]
          ? VALUE_OVERRIDES[fieldKey][valueSource]
          : rawDisplayValue

      return {
        label: LABEL_OVERRIDES[fieldKey] ?? humanizeLabel(fieldKey),
        displayValue,
        reason: normalizeReason(structured.reason),
      }
    }

    const rawDisplayValue = formatEvidenceValue(rawValue)
    const displayValue =
      typeof rawValue === "string" && VALUE_OVERRIDES[key]?.[rawValue] ? VALUE_OVERRIDES[key][rawValue] : rawDisplayValue

    return {
      label: LABEL_OVERRIDES[key] ?? humanizeLabel(key),
      displayValue,
    }
  })

  const priorityRows = PRIORITY_TRACE_FIELDS
    .map((field) => rows.find((row) => row.label === (LABEL_OVERRIDES[field] ?? humanizeLabel(field))))
    .filter((row): row is EvaluationTraceRow => row !== undefined)

  const remainingRows = rows.filter(
    (row) => !priorityRows.some((priorityRow) => priorityRow.label === row.label && priorityRow.displayValue === row.displayValue)
  )

  return [...priorityRows, ...remainingRows].slice(0, MAX_TRACE_ROWS)
}

function buildUserFacingExplanation(evaluation: PenEvaluationAdapter, traceRows: EvaluationTraceRow[]): string {
  const highBloodPressure = traceRows.find((row) => row.label === "High blood pressure")?.displayValue === "Yes"
  const excludedOption = traceRows.find((row) => row.label === "Excluded Option")?.displayValue
  const preferredFormat = traceRows.find((row) => row.label === "Preferred format")?.displayValue

  if (highBloodPressure && excludedOption && preferredFormat) {
    return `Because you reported high blood pressure, ${excludedOption.toLowerCase()} was excluded for safety. ${preferredFormat} treatment was selected as your safest place to start.`
  }

  if (evaluation.decision_explanation && evaluation.decision_explanation.trim().length > 0) {
    return evaluation.decision_explanation
  }

  return "Your plan was selected from your intake profile and safety context. It can adapt over time as new progress data is collected."
}

export function buildEvaluationViewModel(evaluation: PenEvaluationAdapter): EvaluationViewModel {
  const traceRows = buildTraceRows(evaluation.trace_evidence ?? {})

  return {
    decisionPath: evaluation.decision_path || "pending_review",
    decisionTitle: evaluation.decision_title || "Your treatment plan is ready",
    decisionExplanation: buildUserFacingExplanation(evaluation, traceRows),
    traceRows,
  }
}
