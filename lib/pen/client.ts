import type { PenEvaluateRequest, PenEvaluateResponse } from "./contracts"

const PEN_EVALUATE_PROXY_PATH = "/api/pen/evaluate"

interface ErrorPayload {
  error?: string
  details?: unknown
  status?: number
}

export class PenApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = "PenApiError"
  }
}

async function readErrorPayload(response: Response): Promise<ErrorPayload | null> {
  try {
    return (await response.json()) as ErrorPayload
  } catch {
    return null
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
    const payload = await readErrorPayload(response)
    const message = payload?.error || "Pen evaluation request failed"
    const details = payload?.details ? `: ${JSON.stringify(payload.details)}` : ""
    throw new PenApiError(`${message} (${response.status})${details}`, response.status)
  }

  const payload = (await response.json()) as PenEvaluateResponse

  if (!payload?.frontend_adapter?.evaluation || !payload?.frontend_adapter?.journey) {
    throw new PenApiError("Pen evaluation response is missing frontend_adapter fields")
  }

  return payload
}
