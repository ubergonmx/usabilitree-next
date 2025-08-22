import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "@/env";
import { getCurrentUser } from "@/lib/auth/session";
import { UpdatesList } from "./updates-list";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Updates",
  description: "Latest updates and changes to the platform",
};

export default async function UpdatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Updates</h1>
        <p className="text-sm text-muted-foreground">Latest updates and changes to the platform</p>
      </div>
      <UpdatesList />
    </div>
  );
}
