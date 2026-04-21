import type {
  PenEvaluateResponse,
  PenEvaluationAdapter,
  PenJourneyStateKey,
  PenJourneyStateView,
  PenTraceEvidence,
  PenTraceEvidenceValue,
} from "./contracts"
import { fallbackFrontendAdapter } from "./fallback-adapter"

const JOURNEY_ICONS = new Set(["activity", "calendar", "trending", "check", "camera", "target"])
const RECOMMENDATION_ICONS = new Set(["droplets", "sparkles", "package", "leaf", "pill"])

type JourneyIcon = PenJourneyStateView["progress_strip"]["items"][number]["icon"]
type RecommendationIcon = NonNullable<PenJourneyStateView["recommendation"]["icon"]>

type JourneyViewSource = "live" | "fallback"
type EvaluationViewSource = "live" | "fallback"
type JourneyTraceSource = "live" | "fallback" | "live_empty"

const isJourneyIcon = (value: unknown): value is JourneyIcon =>
  typeof value === "string" && JOURNEY_ICONS.has(value)

const isRecommendationIcon = (value: unknown): value is RecommendationIcon =>
  typeof value === "string" && RECOMMENDATION_ICONS.has(value)

const isTraceEvidenceValue = (value: unknown): value is PenTraceEvidenceValue => {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
    return true
  }

  if (Array.isArray(value)) {
    return true
  }

  if (isRecord(value)) {
    const fieldValid = !("field" in value) || typeof value.field === "string"
    const reasonValid = !("reason" in value) || typeof value.reason === "string"
    return fieldValid && reasonValid
  }

  return false
}

const normalizeTraceEvidence = (
  value: unknown,
  fallback: PenTraceEvidence,
  preferEmptyObjectWhenInvalid = false
): PenTraceEvidence => {
  if (Array.isArray(value)) {
    return value.length > 0 ? ({ items: value } as PenTraceEvidence) : preferEmptyObjectWhenInvalid ? {} : fallback
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return { summary: value } as PenTraceEvidence
  }

  if (!isRecord(value)) {
    return preferEmptyObjectWhenInvalid ? {} : fallback
  }

  const entries = Object.entries(value).filter(([, entryValue]) => isTraceEvidenceValue(entryValue))

  if (entries.length === 0) {
    return preferEmptyObjectWhenInvalid ? {} : fallback
  }

  return Object.fromEntries(entries) as PenTraceEvidence
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const readString = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.length > 0 ? value : fallback

const readBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback

const deriveLiveStageFallback = (rawState: unknown, fallback: PenJourneyStateView): PenJourneyStateView => {
  const safeState = isRecord(rawState) ? rawState : {}
  const rawHero = isRecord(safeState.hero) ? safeState.hero : {}
  const rawNarrative = isRecord(safeState.narrative) ? safeState.narrative : {}
  const rawRecommendation = isRecord(safeState.recommendation) ? safeState.recommendation : {}
  const rawBadge = isRecord(safeState.decision_trace_badge) ? safeState.decision_trace_badge : {}

  return {
    hero: {
      title: readString(rawHero.title, "Your plan update"),
      subtitle: readString(rawHero.subtitle, ""),
      start_date: readString(rawHero.start_date, ""),
      next_review: readString(rawHero.next_review, ""),
      active_plan_label: readString(rawHero.active_plan_label, "Active plan"),
    },
    progress_strip: { items: [] },
    progress_photos: { steps: [] },
    narrative: {
      title: readString(rawNarrative.title, "Current state"),
      text: readString(rawNarrative.text, ""),
    },
    recommendation: {
      show: readBoolean(rawRecommendation.show, false),
      product: readString(rawRecommendation.product, ""),
      description: readString(rawRecommendation.description, ""),
      icon: undefined,
      details: undefined,
    },
    decision_trace_badge: {
      label: readString(rawBadge.label, "Decision trace"),
      state_label: readString(rawBadge.state_label, fallback.decision_trace_badge.state_label),
      trace_evidence: {},
    },
  }
}

function normalizeProgressItems(
  rawProgressStrip: unknown,
  fallback: PenJourneyStateView["progress_strip"]["items"]
): PenJourneyStateView["progress_strip"]["items"] {
  const rawItems = Array.isArray(rawProgressStrip)
    ? rawProgressStrip
    : isRecord(rawProgressStrip) && Array.isArray(rawProgressStrip.items)
      ? rawProgressStrip.items
      : []

  const normalized = rawItems
    .map((item) => {
      if (!isRecord(item)) {
        return null
      }

      const rawIcon = item.icon
      const icon = isJourneyIcon(rawIcon) ? rawIcon : "activity"
      const label =
        typeof item.label === "string"
          ? item.label
          : typeof item.title === "string"
            ? item.title
            : null
      const value =
        typeof item.value === "string"
          ? item.value
          : typeof item.text === "string"
            ? item.text
            : typeof item.status === "string"
              ? item.status
              : null

      if (!label || !value) {
        return null
      }

      return { label, value, icon }
    })
    .filter((item): item is PenJourneyStateView["progress_strip"]["items"][number] => item !== null)

  return normalized.length > 0 ? normalized : fallback
}

function normalizePhotoSteps(
  rawPhotos: unknown,
  fallback: PenJourneyStateView["progress_photos"]["steps"]
): PenJourneyStateView["progress_photos"]["steps"] {
  const rawSteps = Array.isArray(rawPhotos)
    ? rawPhotos
    : isRecord(rawPhotos) && Array.isArray(rawPhotos.steps)
      ? rawPhotos.steps
      : []

  const normalized = rawSteps
    .map((step) => {
      if (!isRecord(step)) {
        return null
      }

      const id =
        typeof step.id === "string"
          ? step.id
          : typeof step.key === "string"
            ? step.key
            : typeof step.slug === "string"
              ? step.slug
              : null
      const label =
        typeof step.label === "string"
          ? step.label
          : typeof step.title === "string"
            ? step.title
            : id
      const unlocked =
        typeof step.unlocked === "boolean"
          ? step.unlocked
          : typeof step.available === "boolean"
            ? step.available
            : typeof step.status === "string"
              ? ["available", "unlocked", "complete", "completed"].includes(step.status.toLowerCase())
              : null

      if (!id || !label || unlocked === null) {
        return null
      }

      return { id, label, unlocked }
    })
    .filter((step): step is PenJourneyStateView["progress_photos"]["steps"][number] => step !== null)

  return normalized.length > 0 ? normalized : fallback
}

function normalizeJourneyStateView(
  rawState: unknown,
  sourceFallback: PenJourneyStateView,
  source: JourneyViewSource
): PenJourneyStateView {
  if (!isRecord(rawState)) {
    return sourceFallback
  }

  const rawHero = isRecord(rawState.hero) ? rawState.hero : {}
  const rawNarrative = isRecord(rawState.narrative) ? rawState.narrative : {}
  const rawRecommendation = isRecord(rawState.recommendation) ? rawState.recommendation : {}
  const rawBadge = isRecord(rawState.decision_trace_badge) ? rawState.decision_trace_badge : {}
  const rawTrace =
    rawBadge.trace_evidence ??
    rawBadge.trace ??
    rawBadge.evidence ??
    rawBadge.details

  const recommendationIcon = rawRecommendation.icon
  const normalizedRecommendationIcon =
    isRecommendationIcon(recommendationIcon)
      ? recommendationIcon
      : sourceFallback.recommendation.icon

  const shouldPreferEmptyLiveTrace = source === "live"

  return {
    hero: {
      title: readString(rawHero.title, sourceFallback.hero.title),
      subtitle: readString(rawHero.subtitle, sourceFallback.hero.subtitle),
      start_date: readString(rawHero.start_date, sourceFallback.hero.start_date),
      next_review: readString(rawHero.next_review, sourceFallback.hero.next_review),
      active_plan_label: readString(rawHero.active_plan_label, sourceFallback.hero.active_plan_label),
    },
    progress_strip: {
      items: normalizeProgressItems(rawState.progress_strip, sourceFallback.progress_strip.items),
    },
    progress_photos: {
      steps: normalizePhotoSteps(rawState.progress_photos, sourceFallback.progress_photos.steps),
    },
    narrative: {
      title: readString(rawNarrative.title, sourceFallback.narrative.title),
      text: readString(rawNarrative.text, sourceFallback.narrative.text),
    },
    recommendation: {
      show: readBoolean(rawRecommendation.show, sourceFallback.recommendation.show),
      product: readString(rawRecommendation.product, sourceFallback.recommendation.product ?? ""),
      description: readString(rawRecommendation.description, sourceFallback.recommendation.description ?? ""),
      icon: normalizedRecommendationIcon,
      requires_medical_approval: readBoolean(rawRecommendation.requires_medical_approval, false),
      details: isRecord(rawRecommendation.details) ? {
        route: readString(rawRecommendation.details.route, ""),
        cadence: readString(rawRecommendation.details.cadence, ""),
        purpose: readString(rawRecommendation.details.purpose, ""),
        review_note: typeof rawRecommendation.details.review_note === "string"
          ? rawRecommendation.details.review_note
          : null,
      } : undefined,
    },
    decision_trace_badge: {
      label: readString(rawBadge.label, sourceFallback.decision_trace_badge.label),
      state_label: readString(rawBadge.state_label, sourceFallback.decision_trace_badge.state_label),
      trace_evidence: normalizeTraceEvidence(
        rawTrace,
        sourceFallback.decision_trace_badge.trace_evidence,
        shouldPreferEmptyLiveTrace
      ),
    },
  }
}

export function selectEvaluationAdapter(response: PenEvaluateResponse | null): PenEvaluationAdapter {
  return response?.frontend_adapter?.evaluation ?? fallbackFrontendAdapter.evaluation
}

export function selectEvaluationViewSource(response: PenEvaluateResponse | null): EvaluationViewSource {
  return isRecord(response?.frontend_adapter?.evaluation) ? "live" : "fallback"
}

export function selectJourneyViewSource(
  response: PenEvaluateResponse | null,
  state: PenJourneyStateKey
): JourneyViewSource {
  const rawState = response?.frontend_adapter?.journey?.[state]
  return isRecord(rawState) ? "live" : "fallback"
}

export function selectJourneyTraceSource(
  response: PenEvaluateResponse | null,
  state: PenJourneyStateKey
): JourneyTraceSource {
  const source = selectJourneyViewSource(response, state)
  if (source === "fallback") {
    return "fallback"
  }

  const rawTrace = response?.frontend_adapter?.journey?.[state]?.decision_trace_badge?.trace_evidence
  const normalized = normalizeTraceEvidence(rawTrace, {}, true)
  return Object.keys(normalized).length > 0 ? "live" : "live_empty"
}

export function selectJourneyStateView(
  response: PenEvaluateResponse | null,
  state: PenJourneyStateKey
): PenJourneyStateView {
  const fallback = fallbackFrontendAdapter.journey[state]
  const rawState = response?.frontend_adapter?.journey?.[state]
  const source = selectJourneyViewSource(response, state)
  const sourceFallback = source === "live" ? deriveLiveStageFallback(rawState, fallback) : fallback

  return normalizeJourneyStateView(rawState, sourceFallback, source)
}

export function getPostIntakePhase(): "evaluation" {
  return "evaluation"
}

export function getInitialJourneyState(): PenJourneyStateKey {
  return "month_0"
}

export const __testables = {
  normalizeJourneyStateView,
  normalizeProgressItems,
  normalizePhotoSteps,
}
