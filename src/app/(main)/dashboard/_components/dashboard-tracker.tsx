"use client";

import { useSurveyTriggers } from "@/lib/hooks/use-survey-triggers";
import { useEffect } from "react";

export function DashboardTracker() {
  const { triggerDashboardVisit } = useSurveyTriggers();

  useEffect(() => {
    // Track dashboard visit for survey targeting
    triggerDashboardVisit("studies");
  }, [triggerDashboardVisit]);

  return null; // This component doesn't render anything
}
