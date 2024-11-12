import { redirect } from "next/navigation";
import { Paths } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth/session";

export default async function Page({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect(Paths.Login);
  }

  return <div></div>;
}
