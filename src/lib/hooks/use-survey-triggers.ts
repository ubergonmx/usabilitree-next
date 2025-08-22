"use client";

import { usePostHog } from "posthog-js/react";

export function useSurveyTriggers() {
  const posthog = usePostHog();

  const triggerStudyCompleted = (studyId: string, studyType: string = "tree_test") => {
    posthog?.capture("study_completed", {
      study_id: studyId,
      study_type: studyType,
      completion_time: Date.now(),
    });
  };

  const triggerDashboardVisit = (pageType: string = "main") => {
    posthog?.capture("dashboard_visit", {
      page_type: pageType,
      timestamp: Date.now(),
    });
  };

  const triggerStudyCreated = (studyId: string, studyType: string = "tree_test") => {
    posthog?.capture("study_created", {
      study_id: studyId,
      study_type: studyType,
      creation_time: Date.now(),
    });
  };

  const triggerFeatureUsed = (featureName: string, context?: Record<string, unknown>) => {
    posthog?.capture("feature_used", {
      feature_name: featureName,
      timestamp: Date.now(),
      ...context,
    });
  };

  const triggerFeedbackRequest = (source: string = "dashboard_nav") => {
    posthog?.capture("feedback_requested", {
      source,
      page: window.location.pathname,
      timestamp: Date.now(),
    });
  };

  return {
    triggerStudyCompleted,
    triggerDashboardVisit,
    triggerStudyCreated,
    triggerFeatureUsed,
    triggerFeedbackRequest,
  };
}
