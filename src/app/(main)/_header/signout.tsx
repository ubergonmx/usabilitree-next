"use client";

import nProgress from "nprogress";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
export function SignOutButton() {
  return (
    <Button
      className="btn btn-primary"
      onClick={async () => {
        nProgress.start();
        logout().then(() => {
          nProgress.done();
        });
      }}
    >
      Logout
    </Button>
  );
}
