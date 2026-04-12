import test from "node:test"
import assert from "node:assert/strict"
import { evaluatePen } from "../lib/pen/client"
import {
  canonicalDemoEvaluateRequest,
  canonicalDemoEvaluateResponse
} from "../lib/pen/demo-fixture"

test("evaluatePen returns typed response on success", async () => {
  const originalFetch = globalThis.fetch

  globalThis.fetch = (async () =>
    new Response(JSON.stringify(canonicalDemoEvaluateResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })) as typeof fetch

  const response = await evaluatePen(canonicalDemoEvaluateRequest)

  assert.equal(
    response.frontend_adapter.evaluation.decision_path,
    canonicalDemoEvaluateResponse.frontend_adapter.evaluation.decision_path
  )

  globalThis.fetch = originalFetch
})
