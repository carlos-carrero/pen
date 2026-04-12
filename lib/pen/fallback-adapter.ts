import type { PenFrontendAdapter } from "./contracts"

export const fallbackFrontendAdapter: PenFrontendAdapter = {
  evaluation: {
    decision_path: "topical_treatment",
    decision_title: "Your treatment plan is ready",
    decision_explanation:
      "This route was selected from your clinical profile and intake context. Your plan can adapt over time as new data is collected.",
    trace_evidence: {
      patient_age: 29,
      norwood_stage: 3,
      primary_area: ["temples", "crown"],
      main_goal: "improve_density",
      high_blood_pressure: true,
      cardiovascular_conditions: false,
      current_medication: false,
      prior_treatment_use: false,
      treatment_preference: "topical",
      routine_consistency: "very_consistent",
      decision_path: "Topical treatment",
      excluded_option: "Oral treatment",
      safety_reason: "Oral treatment excluded due to high blood pressure"
    }
  },
  journey: {
    month_0: {
      hero: {
        title: "Your plan is ready",
        subtitle: "Your starting path has been selected based on your intake and health profile.",
        start_date: "April 2026",
        next_review: "in 6 weeks",
        active_plan_label: "Active plan: Topical treatment"
      },
      progress_strip: {
        items: [
          { label: "Plan status", value: "Activated", icon: "check" },
          { label: "Baseline photos", value: "Uploaded", icon: "camera" },
          { label: "Next milestone", value: "Week 6 check-in", icon: "target" }
        ]
      },
      progress_photos: {
        steps: [
          { id: "baseline", label: "Baseline", unlocked: true },
          { id: "week_6", label: "Week 6", unlocked: false },
          { id: "month_3", label: "Month 3", unlocked: false },
          { id: "month_6", label: "Month 6", unlocked: false }
        ]
      },
      narrative: {
        title: "How your plan begins",
        text: "Your treatment has been activated and your baseline has been recorded. We'll use your upcoming check-ins and progress photos to track how your plan is performing over time."
      },
      recommendation: {
        show: true,
        product: "Starter Scalp Support",
        description:
          "Chosen to complement your topical routine from the beginning and support comfort during early treatment.",
        icon: "leaf"
      },
      decision_trace_badge: {
        label: "Decision trace",
        state_label: "Baseline",
        trace_evidence: {
          patient_age: 29,
          norwood_stage: 3,
          excluded_option: "Oral treatment",
          safety_reason: "Oral treatment excluded due to high blood pressure"
        }
      }
    },
    week_6: {
      hero: {
        title: "Your plan is active",
        subtitle: "Your topical treatment is moving in the right direction. Early indicators look positive.",
        start_date: "April 2026",
        next_review: "in 6 weeks",
        active_plan_label: "Active plan: Topical treatment"
      },
      progress_strip: {
        items: [
          { label: "Consistency", value: "Strong this month", icon: "activity" },
          { label: "Latest update", value: "Week 6 check-in", icon: "calendar" },
          { label: "Progress", value: "Early stabilization", icon: "trending" }
        ]
      },
      progress_photos: {
        steps: [
          { id: "baseline", label: "Baseline", unlocked: true },
          { id: "week_6", label: "Week 6", unlocked: true },
          { id: "month_3", label: "Month 3", unlocked: false },
          { id: "month_6", label: "Month 6", unlocked: false }
        ]
      },
      narrative: {
        title: "How your plan is going",
        text: "You've stayed consistent with treatment and haven't reported significant side effects. Early signals suggest your current plan is moving in the right direction. Continue with your routine for now."
      },
      recommendation: {
        show: true,
        product: "Calming Scalp Serum",
        description: "Chosen to complement your topical routine and support scalp comfort during early treatment.",
        icon: "droplets"
      },
      decision_trace_badge: {
        label: "Decision trace",
        state_label: "Week 6",
        trace_evidence: {
          progress: "early_stabilization",
          safety_profile: "stable"
        }
      }
    },
    month_3: {
      hero: {
        title: "Your plan is responding",
        subtitle: "Three months of consistency. Your scalp is showing clear signs of response.",
        start_date: "April 2026",
        next_review: "in 4 weeks",
        active_plan_label: "Active plan: Topical treatment"
      },
      progress_strip: {
        items: [
          { label: "Consistency", value: "Excellent", icon: "activity" },
          { label: "Latest update", value: "Month 3 review", icon: "calendar" },
          { label: "Progress", value: "Visible response", icon: "trending" }
        ]
      },
      progress_photos: {
        steps: [
          { id: "baseline", label: "Baseline", unlocked: true },
          { id: "week_6", label: "Week 6", unlocked: true },
          { id: "month_3", label: "Month 3", unlocked: true },
          { id: "month_6", label: "Month 6", unlocked: false }
        ]
      },
      narrative: {
        title: "How your plan is going",
        text: "Three months of consistency are beginning to show results. Your scalp is responding positively to treatment, and your current path still appears appropriate."
      },
      recommendation: {
        show: true,
        product: "Scalp Support Formula",
        description: "Selected to support consistency and help optimize your current topical routine.",
        icon: "sparkles"
      },
      decision_trace_badge: {
        label: "Decision trace",
        state_label: "Month 3",
        trace_evidence: {
          progress: "visible_response",
          adherence: "excellent"
        }
      }
    },
    month_6: {
      hero: {
        title: "Your plan is holding steady",
        subtitle: "Six months completed. Your treatment response remains stable and within the expected range.",
        start_date: "April 2026",
        next_review: "annual review scheduled",
        active_plan_label: "Active plan: Topical treatment"
      },
      progress_strip: {
        items: [
          { label: "Consistency", value: "Consistent", icon: "activity" },
          { label: "Latest update", value: "Month 6 evaluation", icon: "calendar" },
          { label: "Progress", value: "Sustained results", icon: "trending" }
        ]
      },
      progress_photos: {
        steps: [
          { id: "baseline", label: "Baseline", unlocked: true },
          { id: "week_6", label: "Week 6", unlocked: true },
          { id: "month_3", label: "Month 3", unlocked: true },
          { id: "month_6", label: "Month 6", unlocked: true }
        ]
      },
      narrative: {
        title: "How your plan is going",
        text: "Six months completed. Your adherence has remained strong, your safety profile is stable, and your results are within the expected range for this treatment."
      },
      recommendation: {
        show: true,
        product: "Hair Maintenance Kit",
        description: "Designed to help sustain your long-term results and support ongoing topical treatment.",
        icon: "package"
      },
      decision_trace_badge: {
        label: "Decision trace",
        state_label: "Month 6",
        trace_evidence: {
          progress: "sustained_results",
          renewal: "annual_review"
        }
      }
    }
  }
}
