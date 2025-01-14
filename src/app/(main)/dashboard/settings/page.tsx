import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "@/env";
import { getCurrentUser } from "@/lib/auth/session";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Settings",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="grid gap-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <SettingsForm user={user} />
      </div>
    </div>
  );
}
