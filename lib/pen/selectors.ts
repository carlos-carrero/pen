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
const RECOMMENDATION_ICONS = new Set(["droplets", "sparkles", "package", "leaf"])

type JourneyIcon = PenJourneyStateView["progress_strip"]["items"][number]["icon"]
type RecommendationIcon = NonNullable<PenJourneyStateView["recommendation"]["icon"]>

const isJourneyIcon = (value: unknown): value is JourneyIcon =>
  typeof value === "string" && JOURNEY_ICONS.has(value)

const isRecommendationIcon = (value: unknown): value is RecommendationIcon =>
  typeof value === "string" && RECOMMENDATION_ICONS.has(value)

const isTraceEvidenceValue = (value: unknown): value is PenTraceEvidenceValue => {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
    return true
  }

  if (Array.isArray(value)) {
    return value.every((entry) =>
      typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean"
    )
  }

  if (isRecord(value)) {
    const fieldValid = !("field" in value) || typeof value.field === "string"
    const reasonValid = !("reason" in value) || typeof value.reason === "string"
    return fieldValid && reasonValid
  }

  return false
}

const normalizeTraceEvidence = (value: unknown, fallback: PenTraceEvidence): PenTraceEvidence => {
  if (!isRecord(value)) {
    return fallback
  }

  const entries = Object.entries(value).filter(([, entryValue]) => isTraceEvidenceValue(entryValue))

  if (entries.length === 0) {
    return fallback
  }

  return Object.fromEntries(entries) as PenTraceEvidence
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const readString = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.length > 0 ? value : fallback

const readBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback

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
      const icon = isJourneyIcon(rawIcon) ? rawIcon : null
      const label = typeof item.label === "string" ? item.label : null
      const value = typeof item.value === "string" ? item.value : null

      if (!icon || !label || !value) {
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

      const id = typeof step.id === "string" ? step.id : null
      const label = typeof step.label === "string" ? step.label : null
      const unlocked = typeof step.unlocked === "boolean" ? step.unlocked : null

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
  fallback: PenJourneyStateView
): PenJourneyStateView {
  if (!isRecord(rawState)) {
    return fallback
  }

  const rawHero = isRecord(rawState.hero) ? rawState.hero : {}
  const rawNarrative = isRecord(rawState.narrative) ? rawState.narrative : {}
  const rawRecommendation = isRecord(rawState.recommendation) ? rawState.recommendation : {}
  const rawBadge = isRecord(rawState.decision_trace_badge) ? rawState.decision_trace_badge : {}

  const recommendationIcon = rawRecommendation.icon
  const normalizedRecommendationIcon =
    isRecommendationIcon(recommendationIcon)
      ? recommendationIcon
      : fallback.recommendation.icon

  return {
    hero: {
      title: readString(rawHero.title, fallback.hero.title),
      subtitle: readString(rawHero.subtitle, fallback.hero.subtitle),
      start_date: readString(rawHero.start_date, fallback.hero.start_date),
      next_review: readString(rawHero.next_review, fallback.hero.next_review),
      active_plan_label: readString(rawHero.active_plan_label, fallback.hero.active_plan_label),
    },
    progress_strip: {
      items: normalizeProgressItems(rawState.progress_strip, fallback.progress_strip.items),
    },
    progress_photos: {
      steps: normalizePhotoSteps(rawState.progress_photos, fallback.progress_photos.steps),
    },
    narrative: {
      title: readString(rawNarrative.title, fallback.narrative.title),
      text: readString(rawNarrative.text, fallback.narrative.text),
    },
    recommendation: {
      show: readBoolean(rawRecommendation.show, fallback.recommendation.show),
      product: readString(rawRecommendation.product, fallback.recommendation.product ?? ""),
      description: readString(rawRecommendation.description, fallback.recommendation.description ?? ""),
      icon: normalizedRecommendationIcon,
    },
    decision_trace_badge: {
      label: readString(rawBadge.label, fallback.decision_trace_badge.label),
      state_label: readString(rawBadge.state_label, fallback.decision_trace_badge.state_label),
      trace_evidence: normalizeTraceEvidence(
        rawBadge.trace_evidence,
        fallback.decision_trace_badge.trace_evidence
      ),
    },
  }
}

export function selectEvaluationAdapter(response: PenEvaluateResponse | null): PenEvaluationAdapter {
  return response?.frontend_adapter?.evaluation ?? fallbackFrontendAdapter.evaluation
}

export function selectJourneyStateView(
  response: PenEvaluateResponse | null,
  state: PenJourneyStateKey
): PenJourneyStateView {
  const fallback = fallbackFrontendAdapter.journey[state]
  const rawState = response?.frontend_adapter?.journey?.[state]

  return normalizeJourneyStateView(rawState, fallback)
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
