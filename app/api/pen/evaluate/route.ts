import { NextResponse } from "next/server"

export const runtime = "nodejs"

const DEFAULT_SOFICCA_BASE_URL = "http://127.0.0.1:8000"
const PEN_DEBUG_PAYLOAD = process.env.PEN_DEBUG_PAYLOAD === "1"
const BRANCH_FIELDS = [
  "high_blood_pressure",
  "cardiovascular_conditions",
  "prior_treatment_use",
  "had_side_effects",
  "scalp_sensitivities",
  "routine_consistency",
  "priority_factor",
  "treatment_preference",
] as const

interface ProxyErrorBody {
  error: string
  details?: unknown
  status?: number
  upstream?: string
}

interface FetchErrorDetails {
  name?: string
  message: string
  cause?: {
    message?: string
    code?: string
    errno?: number
    syscall?: string
  }
}

function resolveSoficcaBaseUrl(): string {
  const configured = process.env.SOFICCA_BASE_URL?.trim()
  const baseUrl = configured && configured.length > 0 ? configured : DEFAULT_SOFICCA_BASE_URL
  return baseUrl.replace(/\/$/, "")
}

async function parseBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new Error("INVALID_JSON")
  }
}

function tryParseJson(raw: string): unknown {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return { raw }
  }
}

function getFetchErrorDetails(error: unknown): FetchErrorDetails {
  if (error instanceof Error) {
    const cause = error.cause

    return {
      name: error.name,
      message: error.message,
      cause:
        cause && typeof cause === "object"
          ? {
              message: "message" in cause ? String(cause.message) : undefined,
              code: "code" in cause ? String(cause.code) : undefined,
              errno: "errno" in cause && typeof cause.errno === "number" ? cause.errno : undefined,
              syscall: "syscall" in cause ? String(cause.syscall) : undefined,
            }
          : undefined,
    }
  }

  return {
    message: "Unknown upstream error",
  }
}

function extractBranchFields(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return {}
  }

  const record = value as Record<string, unknown>
  return Object.fromEntries(BRANCH_FIELDS.map((field) => [field, record[field]]))
}

export async function POST(request: Request) {
  const baseUrl = resolveSoficcaBaseUrl()
  const upstreamUrl = `${baseUrl}/v1/pen/evaluate`

  let requestBody: unknown

  try {
    requestBody = await parseBody(request)
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return NextResponse.json<ProxyErrorBody>(
        {
          error: "Invalid JSON body",
          details: "Request payload must be valid JSON",
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ProxyErrorBody>(
      {
        error: "Unable to parse request body",
        details: error instanceof Error ? error.message : "Unknown parse error",
      },
      { status: 502 }
    )
  }

  if (PEN_DEBUG_PAYLOAD) {
    console.info("[pen-debug][proxy] incoming request branch fields", extractBranchFields(requestBody))
  }

  try {
    const backendResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    })

    const raw = await backendResponse.text()
    const parsed = tryParseJson(raw)

    if (PEN_DEBUG_PAYLOAD) {
      const parsedRecord = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null
      const frontendAdapter =
        parsedRecord && typeof parsedRecord.frontend_adapter === "object"
          ? (parsedRecord.frontend_adapter as Record<string, unknown>)
          : null
      const evaluation =
        frontendAdapter && typeof frontendAdapter.evaluation === "object"
          ? (frontendAdapter.evaluation as Record<string, unknown>)
          : null

      console.info("[pen-debug][proxy] upstream response summary", {
        decision_path: evaluation?.decision_path,
        trace_branch_fields: extractBranchFields(evaluation?.trace_evidence),
      })
    }

    if (!backendResponse.ok) {
      console.error("[pen-proxy] Upstream non-OK response", {
        status: backendResponse.status,
        upstreamUrl,
      })

      return NextResponse.json<ProxyErrorBody>(
        {
          error: "Soficca evaluate request failed",
          status: backendResponse.status,
          details: parsed,
          upstream: upstreamUrl,
        },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(parsed, { status: backendResponse.status })
  } catch (error) {
    const fetchError = getFetchErrorDetails(error)

    console.error("[pen-proxy] Unable to reach upstream", {
      upstreamUrl,
      ...fetchError,
    })

    return NextResponse.json<ProxyErrorBody>(
      {
        error: "Unable to reach Soficca evaluate service",
        details: fetchError,
        upstream: upstreamUrl,
      },
      { status: 502 }
    )
  }
}

export const __testables = {
  resolveSoficcaBaseUrl,
  tryParseJson,
  getFetchErrorDetails,
}
