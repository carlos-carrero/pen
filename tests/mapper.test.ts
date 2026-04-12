import test from "node:test"
import assert from "node:assert/strict"
import { canonicalDemoEvaluateRequest, canonicalDemoIntakeData } from "../lib/pen/demo-fixture"
import { mapIntakeToPenEvaluateRequest } from "../lib/pen/mapper"

test("mapIntakeToPenEvaluateRequest maps explicit inputs without defaults", () => {
  const request = mapIntakeToPenEvaluateRequest(canonicalDemoIntakeData)

  assert.deepEqual(request, canonicalDemoEvaluateRequest)
})
