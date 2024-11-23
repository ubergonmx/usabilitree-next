import { Button } from "@/components/ui/button";
import Link from "next/link";
import Logo from "@/components/logo";
import { Paths } from "@/lib/constants";
import { User } from "@/db/schema";

export async function Header({ user }: { user: User | undefined }) {
  return (
    <header className="mx-auto my-5 flex max-w-5xl items-center justify-between px-5 lg:px-0">
      <Link className="flex" href="/">
        <Logo />
      </Link>
      <div>
        {!user ? (
          <Link href={Paths.Login}>
            <Button size="sm" variant="secondary">
              Login
            </Button>
          </Link>
        ) : (
          <Link href={Paths.Dashboard}>
            <Button size="sm" variant="secondary">
              Dashboard
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
