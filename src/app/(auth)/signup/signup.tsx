"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DiscordLogoIcon, GoogleLogoIcon } from "@/components/icons";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import Logo from "@/components/logo";

export function Signup() {
  const [state, formAction] = useFormState(signup, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center">
        <CardTitle>
          <Logo />
        </CardTitle>
        <CardDescription className="text-center">Sign up to start using the app</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-between gap-2 sm:gap-0">
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/api/login/discord" prefetch={false}>
              <DiscordLogoIcon className="h-5 w-5" />
              Sign up with Discord
            </Link>
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/api/login/google" prefetch={false}>
              <GoogleLogoIcon className="h-5 w-5" />
              Sign up with Google
            </Link>
          </Button>
        </div>
        <div className="my-2 flex items-center">
          <div className="flex-grow border-t border-muted" />
          <div className="mx-2 text-muted-foreground">or</div>
          <div className="flex-grow border-t border-muted" />
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              required
              placeholder="email@example.com"
              autoComplete="email"
              name="email"
              type="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="********"
            />
          </div>

          {state?.fieldError ? (
            <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              {Object.values(state.fieldError).map((err) => (
                <li className="ml-4" key={err}>
                  {err}
                </li>
              ))}
            </ul>
          ) : state?.formError ? (
            <p className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              {state?.formError}
            </p>
          ) : null}
          <div>
            <Button variant="linkHover2" size="sm" className="p-0 after:w-[188px]" asChild>
              <Link href="/login">Already signed up? Login instead.</Link>
            </Button>
          </div>

          <SubmitButton className="w-full" aria-label="submit-btn">
            Sign Up
          </SubmitButton>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Cancel</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
