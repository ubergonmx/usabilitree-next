"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileTextIcon, GearIcon, BellIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Studies",
    href: "/dashboard",
    icon: FileTextIcon,
  },
  // {
  //   title: "Billing",
  //   href: "/dashboard/billing",
  //   icon: CreditCard,
  // },
  {
    title: "Updates",
    href: "/dashboard/updates",
    icon: BellIcon,
    hasNewContent: true,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: GearIcon,
  },
];

interface Props {
  className?: string;
}

export function DashboardNav({ className }: Props) {
  const path = usePathname();
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false);

  useEffect(() => {
    // Check if user has seen the latest updates
    const lastSeenUpdate = localStorage.getItem("lastSeenUpdate");
    const latestUpdateDate = "2024-03-20"; // Match your latest update date
    setHasUnreadUpdates(!lastSeenUpdate || lastSeenUpdate < latestUpdateDate);
  }, []);

  useEffect(() => {
    // Mark updates as read when visiting the updates page
    if (path === "/dashboard/updates") {
      localStorage.setItem("lastSeenUpdate", "2024-03-20"); // Match your latest update date
      setHasUnreadUpdates(false);
    }
  }, [path]);

  return (
    <nav className={cn(className)}>
      {items.map((item) => (
        <Link href={item.href} key={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              path === item.href ? "bg-accent" : "transparent"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
            {item.hasNewContent && hasUnreadUpdates && (
              <span className="relative ml-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-theme opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-theme"></span>
              </span>
            )}
          </span>
        </Link>
      ))}
    </nav>
  );
}
