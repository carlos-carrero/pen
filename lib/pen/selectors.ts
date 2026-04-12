import type {
  PenEvaluateResponse,
  PenEvaluationAdapter,
  PenJourneyStateKey,
  PenJourneyStateView
} from "./contracts"
import { fallbackFrontendAdapter } from "./fallback-adapter"

export function selectEvaluationAdapter(response: PenEvaluateResponse | null): PenEvaluationAdapter {
  return response?.frontend_adapter?.evaluation ?? fallbackFrontendAdapter.evaluation
}

export function selectJourneyStateView(
  response: PenEvaluateResponse | null,
  state: PenJourneyStateKey
): PenJourneyStateView {
  return response?.frontend_adapter?.journey?.[state] ?? fallbackFrontendAdapter.journey[state]
}

export function getPostIntakePhase(): "evaluation" {
  return "evaluation"
}

export function getInitialJourneyState(): PenJourneyStateKey {
  return "month_0"
}
