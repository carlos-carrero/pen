"use client"

import { useState } from "react"
import { Droplets, Sparkles, Package, Leaf, Pill, X } from "lucide-react"
import type { PenJourneyStateView } from "@/lib/pen/contracts"

interface CuratedUpsellProps {
  journeyView: PenJourneyStateView
}

const iconMap = {
  droplets: Droplets,
  sparkles: Sparkles,
  package: Package,
  leaf: Leaf,
  pill: Pill,
}

export function CuratedUpsell({ journeyView }: CuratedUpsellProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const content = journeyView.recommendation

  if (!content.show) {
    return null
  }

  const IconComponent = iconMap[content.icon || "sparkles"]

  return (
    <>
      <section className="rounded-2xl bg-[#FFFCF8] p-6">
        <h3 className="mb-5 font-mono text-xs font-medium uppercase tracking-wide text-[#9A948C]">
          Selected for your current plan
        </h3>
        <div className="flex gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#F6F1E8]">
            <IconComponent className="h-7 w-7 text-[#5E7C6B]" />
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-sans text-base font-medium text-[#161616]">
              {content.product}
            </h4>
            <p className="font-mono text-sm leading-relaxed text-[#5F5A54]">
              {content.description}
            </p>
            {content.requires_medical_approval && (
              <p className="mt-1 font-mono text-xs text-[#9A948C]">
                Subject to medical approval.
              </p>
            )}
            {content.details && (
              <button
                onClick={() => setDetailsOpen(true)}
                className="mt-3 w-fit rounded-lg border border-[#2F5D50] bg-transparent px-4 py-2 font-sans text-sm font-medium text-[#2F5D50] transition-colors hover:bg-[#2F5D50] hover:text-white"
              >
                View details
              </button>
            )}
          </div>
        </div>
      </section>

      {detailsOpen && content.details && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setDetailsOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-[#FFFCF8] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDetailsOpen(false)}
              className="absolute right-4 top-4 text-[#9A948C] transition-colors hover:text-[#161616]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F1E8]">
                <IconComponent className="h-5 w-5 text-[#5E7C6B]" />
              </div>
              <h3 className="font-sans text-base font-medium text-[#161616]">
                {content.product}
              </h3>
            </div>
            <dl className="space-y-4">
              <div>
                <dt className="font-mono text-xs font-medium uppercase tracking-wide text-[#9A948C]">
                  Route
                </dt>
                <dd className="mt-0.5 font-mono text-sm text-[#5F5A54]">
                  {content.details.route}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs font-medium uppercase tracking-wide text-[#9A948C]">
                  Usage
                </dt>
                <dd className="mt-0.5 font-mono text-sm text-[#5F5A54]">
                  {content.details.cadence}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs font-medium uppercase tracking-wide text-[#9A948C]">
                  Purpose
                </dt>
                <dd className="mt-0.5 font-mono text-sm text-[#5F5A54]">
                  {content.details.purpose}
                </dd>
              </div>
              {content.details.review_note && (
                <div>
                  <dt className="font-mono text-xs font-medium uppercase tracking-wide text-[#9A948C]">
                    Clinical note
                  </dt>
                  <dd className="mt-0.5 font-mono text-sm text-[#5F5A54]">
                    {content.details.review_note}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </>
  )
}
