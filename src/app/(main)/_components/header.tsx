import Link from "next/link";
import { UserDropdown } from "@/app/(main)/_components/user-dropdown";
import { getCurrentUser } from "@/lib/auth/session";
import Logo from "@/components/logo";
import { FeedbackButton } from "@/components/feedback-button";
import { CoffeeButton } from "@/components/coffee-button";

export const Header = async () => {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 p-0">
      <div className="container flex items-center gap-2 px-2 py-2 lg:px-4">
        <Link className="flex items-center justify-center text-xl font-medium" href="/">
          <Logo />
        </Link>
        {user ? (
          <div className="ml-auto flex items-center gap-2">
            <CoffeeButton variant="header" />
            <FeedbackButton variant="header" />
            <UserDropdown email={user.email} avatar={user.avatar} />
          </div>
        ) : null}
      </div>
    </header>
  );
};
