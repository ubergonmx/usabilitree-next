"use client";

import { MessageSquareCodeIcon } from "@/components/icons";
import { useSurveyTriggers } from "@/lib/hooks/use-survey-triggers";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface FeedbackButtonProps {
  className?: string;
  variant?: "header" | "nav";
}

export function FeedbackButton({ className, variant = "nav" }: FeedbackButtonProps) {
  const { triggerFeedbackRequest } = useSurveyTriggers();

  const handleFeedbackClick = (): void => {
    triggerFeedbackRequest(variant === "header" ? "header" : "dashboard_nav");
  };

  if (variant === "header") {
    return (
      <Button
        onClick={handleFeedbackClick}
        className={cn(
          "items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground md:hidden",
          className
        )}
        variant={"outline"}
      >
        <MessageSquareCodeIcon className="h-4 w-4" />
        Give Feedback
      </Button>
    );
  }

  return (
    <button
      onClick={handleFeedbackClick}
      className={cn(
        "group hidden items-center whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent hover:text-accent-foreground md:flex",
        className
      )}
    >
      <MessageSquareCodeIcon className="mr-2 h-4 w-4 flex-shrink-0" />
      <span>Give Feedback</span>
    </button>
  );
}
