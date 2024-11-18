import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import LightIcon from "@/assets/icons/icon-light.svg";
import DarkIcon from "@/assets/icons/icon-dark.svg";
import { ThemeProvider } from "@/providers/theme-provider";
import { APP_TITLE } from "@/lib/constants";
import localFont from "next/font/local";
import { CSPostHogProvider } from "@/providers/posthog-provider";
import PostHogPageView from "@/components/posthog/post-hog-page-view-";
import { Suspense } from "react";

// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"] });

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: APP_TITLE,
    template: `%s | ${APP_TITLE}`,
  },
  description: "UsabiliTree - Grow your UX with Tree Testing",
  icons: {
    icon: [
      {
        rel: "icon",
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
        url: LightIcon.src,
      },
      {
        rel: "icon",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg/xml",
        url: DarkIcon.src,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CSPostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            {children}
            <Toaster />
          </ThemeProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
