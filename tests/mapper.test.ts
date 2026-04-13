import test from "node:test"
import assert from "node:assert/strict"
import { canonicalDemoEvaluateRequest, canonicalDemoIntakeData } from "../lib/pen/demo-fixture"
import { mapIntakeToPenEvaluateRequest } from "../lib/pen/mapper"

test("mapIntakeToPenEvaluateRequest maps canonical case with dependent prior-treatment normalization", () => {
  const request = mapIntakeToPenEvaluateRequest(canonicalDemoIntakeData)

  assert.deepEqual(request, canonicalDemoEvaluateRequest)
  assert.equal("intake" in request, false)
  assert.equal(request.prior_treatment_use, false)
  assert.equal(request.had_side_effects, false)
  assert.equal(request.which_treatment, "")
})
