"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import type { User } from "@/db/schema";

export function usePostHogIdentify(user: User | null | undefined) {
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;

    if (user) {
      // Identify the user with PostHog
      posthog.identify(user.id, {
        email: user.email,
        email_verified: user.emailVerified,
        has_password: !!user.hashedPassword,
        has_discord: !!user.discordId,
        has_google: !!user.googleId,
        has_stripe_subscription: !!user.stripeSubscriptionId,
        stripe_customer_id: user.stripeCustomerId,
        created_at: user.createdAt,
        avatar: user.avatar,
        // Add subscription status if you want to track plan types
        subscription_status: user.stripeSubscriptionId ? "active" : "free",
      });
    } else {
      // Reset identification when user logs out
      posthog.reset();
    }
  }, [user, posthog]);
}
