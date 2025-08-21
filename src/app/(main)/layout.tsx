import { type ReactNode } from "react";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import { PostHogIdentifier } from "./_components/posthog-identifier";
import { getCurrentUser } from "@/lib/auth/session";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();

  return (
    <>
      <PostHogIdentifier user={user} />
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
