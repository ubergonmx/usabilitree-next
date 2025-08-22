import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Paths } from "@/lib/constants";
import { Login } from "./login";

export const metadata = {
  title: "Login",
  description: "Login Page",
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) redirect(Paths.Dashboard);

  return <Login />;
}
