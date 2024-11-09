import { redirect } from "next/navigation";
import { Signup } from "./signup";
import { getCurrentUser } from "@/lib/auth/session";
import { Paths } from "@/lib/constants";

export const metadata = {
  title: "Sign Up",
  description: "Signup Page",
};

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) redirect(Paths.Dashboard);

  return <Signup />;
}
