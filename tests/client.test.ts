import test from "node:test"
import assert from "node:assert/strict"
import { PenApiError, evaluatePen } from "../lib/pen/client"
import {
  canonicalDemoEvaluateRequest,
  canonicalDemoEvaluateResponse
} from "../lib/pen/demo-fixture"

test("evaluatePen calls same-origin proxy and sends canonical flat payload", async () => {
  const originalFetch = globalThis.fetch
  let calledUrl = ""
  let rawBody = ""

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calledUrl = String(input)
    rawBody = String(init?.body ?? "")

    return new Response(JSON.stringify(canonicalDemoEvaluateResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }) as typeof fetch

  const response = await evaluatePen(canonicalDemoEvaluateRequest)
  const parsedBody = JSON.parse(rawBody) as Record<string, unknown>

  assert.equal(calledUrl, "/api/pen/evaluate")
  assert.equal("intake" in parsedBody, false)
  assert.equal(parsedBody.age, canonicalDemoEvaluateRequest.age)
  assert.equal(
    response.frontend_adapter.evaluation.decision_path,
    canonicalDemoEvaluateResponse.frontend_adapter.evaluation.decision_path
  )

  globalThis.fetch = originalFetch
})

test("evaluatePen surfaces proxy error details when non-OK", async () => {
  const originalFetch = globalThis.fetch

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ error: "Unable to reach Soficca evaluate service", details: "ECONNREFUSED" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    })) as typeof fetch

  await assert.rejects(
    () => evaluatePen(canonicalDemoEvaluateRequest),
    (error: unknown) => {
      assert.ok(error instanceof PenApiError)
      assert.match(error.message, /Unable to reach Soficca evaluate service \(502\)/)
      assert.match(error.message, /ECONNREFUSED/)
      return true
    }
  )

  globalThis.fetch = originalFetch
})
