"use client";

import { usePostHogIdentify } from "@/lib/hooks/use-posthog-identify";
import type { User } from "@/db/schema";

interface PostHogIdentifierProps {
  user: User | null | undefined;
}

export function PostHogIdentifier({ user }: PostHogIdentifierProps) {
  usePostHogIdentify(user);
  return null; // This component doesn't render anything
}
