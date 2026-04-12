import type { PenEvaluateRequest, PenEvaluateResponse } from "./contracts"

const DEFAULT_BASE_URL = "http://localhost:8000"

export class PenApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = "PenApiError"
  }
}

export function resolvePenApiBaseUrl(): string {
  const envBaseUrl = process.env.NEXT_PUBLIC_SOFICCA_BASE_URL?.trim()
  const baseUrl = envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : DEFAULT_BASE_URL
  return baseUrl.replace(/\/$/, "")
}

export async function evaluatePen(request: PenEvaluateRequest): Promise<PenEvaluateResponse> {
  const response = await fetch(`${resolvePenApiBaseUrl()}/v1/pen/evaluate`, {
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
