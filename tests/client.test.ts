import test from "node:test"
import assert from "node:assert/strict"
import { evaluatePen } from "../lib/pen/client"
import {
  canonicalDemoEvaluateRequest,
  canonicalDemoEvaluateResponse
} from "../lib/pen/demo-fixture"

test("evaluatePen calls same-origin proxy and returns typed response", async () => {
  const originalFetch = globalThis.fetch
  let calledUrl = ""

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    calledUrl = String(input)
    return new Response(JSON.stringify(canonicalDemoEvaluateResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }) as typeof fetch

  const response = await evaluatePen(canonicalDemoEvaluateRequest)

  assert.equal(calledUrl, "/api/pen/evaluate")
  assert.equal(
    response.frontend_adapter.evaluation.decision_path,
    canonicalDemoEvaluateResponse.frontend_adapter.evaluation.decision_path
  )

  globalThis.fetch = originalFetch
})
