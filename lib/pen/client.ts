import type { PenEvaluateRequest, PenEvaluateResponse } from "./contracts"

const PEN_EVALUATE_PROXY_PATH = "/api/pen/evaluate"

export class PenApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = "PenApiError"
  }
}

export async function evaluatePen(request: PenEvaluateRequest): Promise<PenEvaluateResponse> {
  const response = await fetch(PEN_EVALUATE_PROXY_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    throw new PenApiError(`Pen evaluation request failed (${response.status})`, response.status)
  }

  const payload = (await response.json()) as PenEvaluateResponse

  if (!payload?.frontend_adapter?.evaluation || !payload?.frontend_adapter?.journey) {
    throw new PenApiError("Pen evaluation response is missing frontend_adapter fields")
  }

  return payload
}
