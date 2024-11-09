"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@/components/icons";
import { logout, verifyEmail, resendVerificationEmail as resendEmail } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import * as NProgress from "nprogress";
import { Button } from "@/components/ui/button";

export const VerifyCode = () => {
  const [verifyEmailState, verifyEmailAction] = useFormState(verifyEmail, null);
  const [resendState, resendAction] = useFormState(resendEmail, null);
  const codeFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resendState?.success) {
      toast("Email sent!");
    }
    if (resendState?.error) {
      toast(resendState.error, {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
    }
  }, [resendState?.error, resendState?.success]);

  useEffect(() => {
    if (verifyEmailState?.error) {
      toast(verifyEmailState.error, {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
    }
  }, [verifyEmailState?.error]);

  return (
    <div className="flex flex-col gap-2">
      <form ref={codeFormRef} action={verifyEmailAction}>
        <Label htmlFor="code">Verification Code</Label>
        <Input className="mt-2" type="text" id="code" name="code" required />
        <SubmitButton className="mt-4 w-full" aria-label="submit-btn">
          Verify
        </SubmitButton>
      </form>
      <form action={resendAction}>
        <SubmitButton className="w-full" variant="secondary">
          Resend Code
        </SubmitButton>
      </form>
      <Button
        variant="linkHover2"
        className="p-0 font-normal after:w-48"
        onClick={async () => {
          NProgress.start();
          logout().then(() => {
            NProgress.done();
          });
        }}
      >
        Log out to use another email.
      </Button>
    </div>
  );
};
