import { NextResponse } from "next/server"

const DEFAULT_SOFICCA_BASE_URL = "http://127.0.0.1:8000"

interface ProxyErrorBody {
  error: string
  details?: unknown
  status?: number
  upstream?: string
}

function resolveSoficcaBaseUrl(): string {
  const configured = process.env.SOFICCA_BASE_URL?.trim()
  const baseUrl = configured && configured.length > 0 ? configured : DEFAULT_SOFICCA_BASE_URL
  return baseUrl.replace(/\/$/, "")
}

<<<<<<< HEAD
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
          details: "Request payload must be valid JSON"
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ProxyErrorBody>(
      {
        error: "Unable to parse request body",
        details: error instanceof Error ? error.message : "Unknown parse error"
      },
      { status: 502 }
    )
  }

  try {
    const backendResponse = await fetch(upstreamUrl, {
=======
export async function POST(request: Request) {
  let requestBody: unknown

  try {
    requestBody = await request.json()
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid JSON request body",
        details: error instanceof Error ? error.message : "Unknown JSON parse error",
      },
      { status: 400 }
    )
  }

  try {
    const backendResponse = await fetch(`${resolveSoficcaBaseUrl()}/v1/pen/evaluate`, {
>>>>>>> 276122b (update pen evaluate route)
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    })

    const raw = await backendResponse.text()
    const parsed = tryParseJson(raw)

    if (!backendResponse.ok) {
      console.error("[pen-proxy] Upstream non-OK response", {
        status: backendResponse.status,
        upstreamUrl
      })

      return NextResponse.json<ProxyErrorBody>(
        {
          error: "Soficca evaluate request failed",
          status: backendResponse.status,
          details: parsed,
<<<<<<< HEAD
          upstream: upstreamUrl
=======
>>>>>>> 276122b (update pen evaluate route)
        },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(parsed, { status: backendResponse.status })
  } catch (error) {
<<<<<<< HEAD
    const message = error instanceof Error ? error.message : "Unknown upstream error"

    console.error("[pen-proxy] Unable to reach upstream", {
      upstreamUrl,
      message
    })

    return NextResponse.json<ProxyErrorBody>(
      {
        error: "Unable to reach Soficca evaluate service",
        details: message,
        upstream: upstreamUrl
=======
    return NextResponse.json(
      {
        error: "Unable to reach Soficca evaluate service",
        details: error instanceof Error ? error.message : "Unknown evaluate proxy error",
>>>>>>> 276122b (update pen evaluate route)
      },
      { status: 502 }
    )
  }
}
