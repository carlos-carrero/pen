"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Check, Upload, Camera } from "lucide-react"

interface IntakeFlowProps {
  onComplete: (data: IntakeData) => void | Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
}

export interface IntakeData {
  // Step 1
  age: string
  norwoodStage: number
  lossNoticed: string
  lossAreas: string[]
  mainGoal: string
  // Step 2
  highBloodPressure: boolean | null
  cardiovascular: boolean | null
  currentMedication: boolean | null
  medicationDetail: string
  usedTreatmentBefore: boolean | null
  whichTreatment: string
  hadSideEffects: boolean | null
  sideEffectDetail: string
  scalpSensitivities: boolean | null
  scalpDetail: string
  // Step 3
  treatmentPreference: string
  consistencyLevel: string
  priorityFactor: string
  // Step 4
  photosUploaded: boolean
}

// Canonical demo case prefilled for Route A (stronger incubator version)
const initialData: IntakeData = {
  age: "29",
  norwoodStage: 3,
  lossNoticed: "1-3 years",
  lossAreas: ["Temples", "Crown"],
  mainGoal: "Improve density",
  highBloodPressure: true,
  cardiovascular: false,
  currentMedication: false,
  medicationDetail: "",
  usedTreatmentBefore: false,
  whichTreatment: "",
  hadSideEffects: null,
  sideEffectDetail: "",
  scalpSensitivities: false,
  scalpDetail: "",
  treatmentPreference: "topical",
  consistencyLevel: "very",
  priorityFactor: "safety",
  photosUploaded: false
}

const norwoodStages = [
  { stage: 1, label: "I", description: "Minimal recession" },
  { stage: 2, label: "II", description: "Slight recession at temples" },
  { stage: 3, label: "III", description: "Deep temple recession" },
  { stage: 4, label: "IV", description: "Further recession, crown thinning" },
  { stage: 5, label: "V", description: "Large areas of loss" },
  { stage: 6, label: "VI", description: "Bridge of hair disappearing" },
  { stage: 7, label: "VII", description: "Most severe pattern" }
]

export function IntakeFlow({ onComplete, isSubmitting = false, submitError = null }: IntakeFlowProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<IntakeData>(initialData)

  const totalSteps = 4

  const updateData = (updates: Partial<IntakeData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const toggleArea = (area: string) => {
    setData(prev => ({
      ...prev,
      lossAreas: prev.lossAreas.includes(area)
        ? prev.lossAreas.filter(a => a !== area)
        : [...prev.lossAreas, area]
    }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.age && data.norwoodStage > 0 && data.lossNoticed && data.mainGoal
      case 2:
        return data.highBloodPressure !== null && data.cardiovascular !== null
      case 3:
        return data.treatmentPreference && data.consistencyLevel && data.priorityFactor
      case 4:
        return data.photosUploaded
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (isSubmitting) {
      return
    }

    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      await onComplete(data)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-sans text-xl font-semibold tracking-tight text-[#161616]">
          Pen
        </h1>
      </header>

      {/* Step Indicator */}
      <div className="mb-10">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i + 1 <= step ? "bg-[#2F5D50]" : "bg-[#E6DED3]"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 font-mono text-xs text-[#9A948C]">
          Step {step} of {totalSteps}
        </p>
      </div>

      {/* Step Content */}
      <div className="rounded-2xl bg-[#FFFCF8] p-8">
        {step === 1 && (
          <StepAboutHair
            data={data}
            updateData={updateData}
            toggleArea={toggleArea}
          />
        )}
        {step === 2 && (
          <StepHealthSafety
            data={data}
            updateData={updateData}
          />
        )}
        {step === 3 && (
          <StepPreferences
            data={data}
            updateData={updateData}
          />
        )}
        {step === 4 && (
          <StepPhotos
            data={data}
            updateData={updateData}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={step === 1 || isSubmitting}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-sans text-sm font-medium transition-all ${
            step === 1
              ? "cursor-not-allowed text-[#C9C2B7]"
              : "text-[#5F5A54] hover:bg-[#FFFCF8]"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-sans text-sm font-medium transition-all ${
            canProceed()
              ? "bg-[#2F5D50] text-white hover:bg-[#264A40]"
              : "cursor-not-allowed bg-[#E6DED3] text-[#9A948C]"
          }`}
        >
          {isSubmitting ? "Analyzing…" : step === totalSteps ? "Submit" : "Continue"}
          {step !== totalSteps && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {(isSubmitting || submitError) && (
        <div className="mt-4 text-center">
          {isSubmitting ? (
            <p className="font-mono text-xs text-[#5F5A54]">Analyzing your profile with Soficca…</p>
          ) : (
            <p className="font-mono text-xs text-[#8C5A5A]">{submitError}</p>
          )}
        </div>
      )}
    </div>
  )
}

// Step 1: About your hair
function StepAboutHair({
  data,
  updateData,
  toggleArea
}: {
  data: IntakeData
  updateData: (updates: Partial<IntakeData>) => void
  toggleArea: (area: string) => void
}) {
  const lossAreas = ["Temples", "Crown", "Diffuse thinning", "Beard"]
  const goals = [
    "Slow hair loss",
    "Improve density",
    "Support temples",
    "Maintain current results"
  ]
  const noticedOptions = [
    "Less than 6 months",
    "6-12 months",
    "1-3 years",
    "Over 3 years"
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-sans text-xl font-semibold text-[#161616]">
          About your hair
        </h2>
        <p className="mt-2 font-mono text-sm text-[#5F5A54]">
          Help us understand your current situation
        </p>
      </div>

      {/* Age */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-[#161616]">
          Age
        </label>
        <input
          type="number"
          value={data.age}
          onChange={(e) => updateData({ age: e.target.value })}
          placeholder="Enter your age"
          className="rounded-xl border border-[#E6DED3] bg-[#FAF7F2] px-4 py-3 font-sans text-sm text-[#161616] placeholder:text-[#9A948C] focus:border-[#2F5D50] focus:outline-none focus:ring-1 focus:ring-[#2F5D50]"
        />
      </div>

      {/* Norwood Stage */}
      <div className="flex flex-col gap-3">
        <label className="font-sans text-sm font-medium text-[#161616]">
          Hair loss stage
        </label>
        <div className="grid grid-cols-7 gap-2">
          {norwoodStages.map((n) => (
            <button
              key={n.stage}
              onClick={() => updateData({ norwoodStage: n.stage })}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                data.norwoodStage === n.stage
                  ? "border-[#2F5D50] bg-[#2F5D50]/5"
                  : "border-[#E6DED3] bg-[#FAF7F2] hover:border-[#C9C2B7]"
              }`}
            >
              <span className={`font-sans text-lg font-semibold ${
                data.norwoodStage === n.stage ? "text-[#2F5D50]" : "text-[#161616]"
              }`}>
                {n.label}
              </span>
            </button>
          ))}
        </div>
        {data.norwoodStage > 0 && (
          <p className="font-mono text-xs text-[#5F5A54]">
            {norwoodStages.find(n => n.stage === data.norwoodStage)?.description}
          </p>
        )}
      </div>

      {/* How long noticed */}
      <div className="flex flex-col gap-3">
        <label className="font-sans text-sm font-medium text-[#161616]">
          How long have you noticed hair loss?
        </label>
        <div className="flex flex-wrap gap-2">
          {noticedOptions.map((option) => (
            <button
              key={option}
              onClick={() => updateData({ lossNoticed: option })}
              className={`rounded-full border px-4 py-2 font-sans text-sm transition-all ${
                data.lossNoticed === option
                  ? "border-[#2F5D50] bg-[#2F5D50]/5 text-[#2F5D50]"
                  : "border-[#E6DED3] text-[#5F5A54] hover:border-[#C9C2B7]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Where seeing it most */}
      <div className="flex flex-col gap-3">
        <label className="font-sans text-sm font-medium text-[#161616]">
          Where are you seeing it most?
        </label>
        <div className="flex flex-wrap gap-2">
          {lossAreas.map((area) => (
            <button
              key={area}
              onClick={() => toggleArea(area)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-sm transition-all ${
                data.lossAreas.includes(area)
                  ? "border-[#2F5D50] bg-[#2F5D50]/5 text-[#2F5D50]"
                  : "border-[#E6DED3] text-[#5F5A54] hover:border-[#C9C2B7]"
              }`}
            >
              {data.lossAreas.includes(area) && (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Main goal */}
      <div className="flex flex-col gap-3">
        <label className="font-sans text-sm font-medium text-[#161616]">
          Main goal
        </label>
        <div className="flex flex-col gap-2">
          {goals.map((goal) => (
            <button
              key={goal}
              onClick={() => updateData({ mainGoal: goal })}
              className={`flex items-center justify-between rounded-xl border px-4 py-3.5 font-sans text-sm transition-all ${
                data.mainGoal === goal
                  ? "border-[#2F5D50] bg-[#2F5D50]/5 text-[#161616]"
                  : "border-[#E6DED3] text-[#5F5A54] hover:border-[#C9C2B7]"
              }`}
            >
              {goal}
              {data.mainGoal === goal && (
                <Check className="h-4 w-4 text-[#2F5D50]" strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Step 2: Health & Safety
function StepHealthSafety({
  data,
  updateData
}: {
  data: IntakeData
  updateData: (updates: Partial<IntakeData>) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-sans text-xl font-semibold text-[#161616]">
          Health & safety
        </h2>
        <p className="mt-2 font-mono text-sm text-[#5F5A54]">
          This helps us determine the safest treatment path for you
        </p>
      </div>

      <YesNoQuestion
        label="Do you have high blood pressure?"
        value={data.highBloodPressure}
        onChange={(val) => updateData({ highBloodPressure: val })}
      />

      <YesNoQuestion
        label="Any cardiovascular conditions?"
        value={data.cardiovascular}
        onChange={(val) => updateData({ cardiovascular: val })}
      />

      <div className="flex flex-col gap-3">
        <YesNoQuestion
          label="Are you currently taking any medication?"
          value={data.currentMedication}
          onChange={(val) => updateData({ currentMedication: val, medicationDetail: "" })}
        />
        {data.currentMedication && (
          <input
            type="text"
            value={data.medicationDetail}
            onChange={(e) => updateData({ medicationDetail: e.target.value })}
            placeholder="Please list your current medications"
            className="rounded-xl border border-[#E6DED3] bg-[#FAF7F2] px-4 py-3 font-sans text-sm text-[#161616] placeholder:text-[#9A948C] focus:border-[#2F5D50] focus:outline-none focus:ring-1 focus:ring-[#2F5D50]"
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <YesNoQuestion
          label="Have you used minoxidil or finasteride before?"
          value={data.usedTreatmentBefore}
          onChange={(val) => updateData({ usedTreatmentBefore: val, whichTreatment: "", hadSideEffects: null, sideEffectDetail: "" })}
        />

        {data.usedTreatmentBefore && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm font-medium text-[#161616]">
                Which one?
              </label>
              <div className="flex flex-wrap gap-2">
                {["Minoxidil", "Finasteride", "Both"].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateData({ whichTreatment: option })}
                    className={`rounded-full border px-4 py-2 font-sans text-sm transition-all ${
                      data.whichTreatment === option
                        ? "border-[#2F5D50] bg-[#2F5D50]/5 text-[#2F5D50]"
                        : "border-[#E6DED3] text-[#5F5A54] hover:border-[#C9C2B7]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <YesNoQuestion
              label="Did you experience any side effects?"
              value={data.hadSideEffects}
              onChange={(val) => updateData({ hadSideEffects: val, sideEffectDetail: "" })}
            />
            {data.hadSideEffects && (
              <input
                type="text"
                value={data.sideEffectDetail}
                onChange={(e) => updateData({ sideEffectDetail: e.target.value })}
                placeholder="Please describe the side effects"
                className="rounded-xl border border-[#E6DED3] bg-[#FAF7F2] px-4 py-3 font-sans text-sm text-[#161616] placeholder:text-[#9A948C] focus:border-[#2F5D50] focus:outline-none focus:ring-1 focus:ring-[#2F5D50]"
              />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <YesNoQuestion
          label="Any scalp sensitivities?"
          value={data.scalpSensitivities}
          onChange={(val) => updateData({ scalpSensitivities: val, scalpDetail: "" })}
        />
        {data.scalpSensitivities && (
          <input
            type="text"
            value={data.scalpDetail}
            onChange={(e) => updateData({ scalpDetail: e.target.value })}
            placeholder="Please describe your scalp sensitivities"
            className="rounded-xl border border-[#E6DED3] bg-[#FAF7F2] px-4 py-3 font-sans text-sm text-[#161616] placeholder:text-[#9A948C] focus:border-[#2F5D50] focus:outline-none focus:ring-1 focus:ring-[#2F5D50]"
          />
        )}
      </div>
    </div>
  )
}

function YesNoQuestion({
  label,
  value,
  onChange
}: {
  label: string
  value: boolean | null
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="font-sans text-sm font-medium text-[#161616]">
        {label}
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className={`flex-1 rounded-xl border px-4 py-3 font-sans text-sm transition-all ${
            value === true
              ? "border-[#2F5D50] bg-[#2F5D50]/5 text-[#2F5D50]"
              : "border-[#E6DED3] text-[#5F5A54] hover:border-[#C9C2B7]"
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`flex-1 rounded-xl border px-4 py-3 font-sans text-sm transition-all ${
            value === false
              ? "border-[#2F5D50] bg-[#2F5D50]/5 text-[#2F5D50]"
              : "border-[#E6DED3] text-[#5F5A54] hover:border-[#C9C2B7]"
          }`}
        >
          No
        </button>
      </div>
    </div>
  )
}

// Step 3: Preferences
function StepPreferences({
  data,
  updateData
}: {
  data: IntakeData
  updateData: (updates: Partial<IntakeData>) => void
}) {
  const treatmentOptions = [
    { value: "topical", label: "Topical", description: "Applied directly to the scalp" },
    { value: "oral", label: "Oral", description: "Taken as a daily pill" },
    { value: "either", label: "Open to either", description: "Let our team recommend" }
  ]

  const consistencyOptions = [
    { value: "very", label: "Very consistent", description: "I can commit to a daily routine" },
    { value: "mostly", label: "Mostly consistent", description: "Most days, but not perfect" },
    { value: "simpler", label: "I prefer something simpler", description: "Less frequent application" }
  ]

  const priorityOptions = [
    { value: "safety", label: "Safety" },
    { value: "convenience", label: "Convenience" },
    { value: "results", label: "Visible results" },
    { value: "maintenance", label: "Long-term maintenance" }
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-sans text-xl font-semibold text-[#161616]">
          Preferences
        </h2>
        <p className="mt-2 font-mono text-sm text-[#5F5A54]">
          Help us tailor your treatment plan
        </p>
      </div>

      {/* Treatment preference */}
      <div className="flex flex-col gap-3">
        <label className="font-sans text-sm font-medium text-[#161616]">
          Which type of treatment are you more comfortable with?
        </label>
        <div className="flex flex-col gap-2">
          {treatmentOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateData({ treatmentPreference: option.value })}
              className={`flex flex-col items-start rounded-xl border px-4 py-3.5 text-left transition-all ${
                data.treatmentPreference === option.value
                  ? "border-[#2F5D50] bg-[#2F5D50]/5"
                  : "border-[#E6DED3] hover:border-[#C9C2B7]"
              }`}
            >
              <span className={`font-sans text-sm ${
                data.treatmentPreference === option.value ? "text-[#161616]" : "text-[#5F5A54]"
              }`}>
                {option.label}
              </span>
              <span className="font-mono text-xs text-[#9A948C]">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Consistency */}
      <div className="flex flex-col gap-3">
        <label className="font-sans text-sm font-medium text-[#161616]">
          How consistent can you realistically be with a daily routine?
        </label>
        <div className="flex flex-col gap-2">
          {consistencyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateData({ consistencyLevel: option.value })}
              className={`flex flex-col items-start rounded-xl border px-4 py-3.5 text-left transition-all ${
                data.consistencyLevel === option.value
                  ? "border-[#2F5D50] bg-[#2F5D50]/5"
                  : "border-[#E6DED3] hover:border-[#C9C2B7]"
              }`}
            >
              <span className={`font-sans text-sm ${
                data.consistencyLevel === option.value ? "text-[#161616]" : "text-[#5F5A54]"
              }`}>
                {option.label}
              </span>
              <span className="font-mono text-xs text-[#9A948C]">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="flex flex-col gap-3">
        <label className="font-sans text-sm font-medium text-[#161616]">
          What matters most to you?
        </label>
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateData({ priorityFactor: option.value })}
              className={`rounded-full border px-4 py-2 font-sans text-sm transition-all ${
                data.priorityFactor === option.value
                  ? "border-[#2F5D50] bg-[#2F5D50]/5 text-[#2F5D50]"
                  : "border-[#E6DED3] text-[#5F5A54] hover:border-[#C9C2B7]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Step 4: Progress Photos
function StepPhotos({
  data,
  updateData
}: {
  data: IntakeData
  updateData: (updates: Partial<IntakeData>) => void
}) {
  const photoSlots = [
    { id: "front", label: "Front" },
    { id: "crown", label: "Crown" },
    { id: "side", label: "Side / Temple" }
  ]

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])

  const simulateUpload = (photoId: string) => {
    const newPhotos = [...uploadedPhotos, photoId]
    setUploadedPhotos(newPhotos)
    if (newPhotos.length === 3) {
      updateData({ photosUploaded: true })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-sans text-xl font-semibold text-[#161616]">
          Progress photos
        </h2>
        <p className="mt-2 font-mono text-sm text-[#5F5A54]">
          Upload your baseline photos to help us track your progress over time.
        </p>
      </div>

      <div className="rounded-xl border border-[#E6DED3] bg-[#FAF7F2] p-4">
        <div className="flex items-start gap-3">
          <Camera className="mt-0.5 h-4 w-4 text-[#5E7C6B]" />
          <p className="font-mono text-xs leading-relaxed text-[#5F5A54]">
            For best results, use consistent lighting and similar angles each time you take progress photos. Natural daylight works best.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {photoSlots.map((slot) => {
          const isUploaded = uploadedPhotos.includes(slot.id)
          return (
            <button
              key={slot.id}
              onClick={() => !isUploaded && simulateUpload(slot.id)}
              disabled={isUploaded}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                isUploaded
                  ? "border-[#2F5D50] bg-[#2F5D50]/5"
                  : "border-dashed border-[#D9D2C7] bg-[#FAF7F2] hover:border-[#C9C2B7]"
              }`}
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                isUploaded ? "bg-[#2F5D50]" : "bg-[#E8E2D9]"
              }`}>
                {isUploaded ? (
                  <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                ) : (
                  <Upload className="h-5 w-5 text-[#9A948C]" />
                )}
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className={`font-sans text-sm font-medium ${
                  isUploaded ? "text-[#161616]" : "text-[#5F5A54]"
                }`}>
                  {slot.label}
                </span>
                <span className="font-mono text-xs text-[#9A948C]">
                  {isUploaded ? "Uploaded" : "Tap to upload"}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
