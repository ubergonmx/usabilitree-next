import "server-only";

import type { ComponentProps } from "react";
import { EmailVerificationTemplate } from "./templates/email-verification";
import { ResetPasswordTemplate } from "./templates/reset-password";
import { render } from "@react-email/render";
import { env } from "@/env";
// import { EMAIL_SENDER } from "@/lib/constants";
// import { createTransport, type TransportOptions } from "nodemailer";

export enum EmailTemplate {
  EmailVerification = "EmailVerification",
  PasswordReset = "PasswordReset",
}

export type PropsMap = {
  [EmailTemplate.EmailVerification]: ComponentProps<typeof EmailVerificationTemplate>;
  [EmailTemplate.PasswordReset]: ComponentProps<typeof ResetPasswordTemplate>;
};

const getEmailTemplate = <T extends EmailTemplate>(template: T, props: PropsMap[NoInfer<T>]) => {
  switch (template) {
    case EmailTemplate.EmailVerification:
      return {
        subject: "Verify your email address",
        body: render(
          <EmailVerificationTemplate {...(props as PropsMap[EmailTemplate.EmailVerification])} />
        ),
      };
    case EmailTemplate.PasswordReset:
      return {
        subject: "Reset your password",
        body: render(
          <ResetPasswordTemplate {...(props as PropsMap[EmailTemplate.PasswordReset])} />
        ),
      };
    default:
      throw new Error("Invalid email template");
  }
};

// const smtpConfig = {
//   host: env.SMTP_HOST,
//   port: env.SMTP_PORT,
//   auth: {
//     user: env.SMTP_USER,
//     pass: env.SMTP_PASSWORD,
//   },
// };

// Uncomment if you're using nodemailer
// const transporter = createTransport(smtpConfig as TransportOptions);

export const sendMail = async <T extends EmailTemplate>(
  to: string,
  template: T,
  props: PropsMap[NoInfer<T>]
) => {
  if (env.MOCK_SEND_EMAIL) {
    console.log("📨 Email sent to:", to, "with template:", template, "and props:", props);
    return;
  }

  const { subject, body } = getEmailTemplate(template, props);

  // Uncomment if you're using nodemailer
  // return transporter.sendMail({ from: EMAIL_SENDER, to, subject, html: body });

  // return await sgMail.send({
  //   from: EMAIL_SENDER,
  //   to,
  //   subject,
  //   html: await body,
  // });

  const composeEmail = {
    from: {
      email: env.EMAIL_SENDER,
      name: "Support",
    },
    subject,
    content: [
      {
        type: "text/html",
        value: await body,
      },
    ],
    personalizations: [
      {
        to: [
          {
            email: to,
            name: "Recipient",
          },
        ],
      },
    ],
  };

  return await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(composeEmail),
  });
};
