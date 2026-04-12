import { NextResponse } from "next/server"

const DEFAULT_SOFICCA_BASE_URL = "http://127.0.0.1:8000"

function resolveSoficcaBaseUrl(): string {
  const configured = process.env.SOFICCA_BASE_URL?.trim()
  const baseUrl = configured && configured.length > 0 ? configured : DEFAULT_SOFICCA_BASE_URL
  return baseUrl.replace(/\/$/, "")
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json()
    const backendResponse = await fetch(`${resolveSoficcaBaseUrl()}/v1/pen/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
      cache: "no-store"
    })

    const raw = await backendResponse.text()
    let parsed: unknown = null

    if (raw) {
      try {
        parsed = JSON.parse(raw)
      } catch {
        parsed = { raw }
      }
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error: "Soficca evaluate request failed",
          status: backendResponse.status,
          details: parsed
        },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(parsed, { status: backendResponse.status })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown evaluate proxy error"

    return NextResponse.json(
      {
        error: "Unable to reach Soficca evaluate service",
        details: message
      },
      { status: 502 }
    )
  }
}
