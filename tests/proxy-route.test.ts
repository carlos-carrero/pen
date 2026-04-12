import test from "node:test"
import assert from "node:assert/strict"
import { __testables } from "../app/api/pen/evaluate/route"

test("resolveSoficcaBaseUrl uses default and trims trailing slash", () => {
  const original = process.env.SOFICCA_BASE_URL
  delete process.env.SOFICCA_BASE_URL
  assert.equal(__testables.resolveSoficcaBaseUrl(), "http://127.0.0.1:8000")

  process.env.SOFICCA_BASE_URL = "http://localhost:9000/"
  assert.equal(__testables.resolveSoficcaBaseUrl(), "http://localhost:9000")

  if (original === undefined) {
    delete process.env.SOFICCA_BASE_URL
  } else {
    process.env.SOFICCA_BASE_URL = original
  }
})

test("getFetchErrorDetails includes cause metadata when present", () => {
  const error = new Error("fetch failed", {
    cause: { code: "ECONNREFUSED", message: "connect ECONNREFUSED 127.0.0.1:8000", errno: -111 },
  })

  const details = __testables.getFetchErrorDetails(error)

  assert.equal(details.message, "fetch failed")
  assert.equal(details.cause?.code, "ECONNREFUSED")
  assert.equal(details.cause?.errno, -111)
})
