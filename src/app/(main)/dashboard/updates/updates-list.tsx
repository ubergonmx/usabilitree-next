import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Update = {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "feature" | "improvement" | "fix" | "message";
  details?: string[];
};

const updates: Update[] = [
  {
    id: "1",
    date: "2024-11-10",
    title: "Initial Launch",
    description: "First release of Usabilitree with basic features.",
    type: "feature",
    details: [
      "Basic authentication system",
      "Study creation interface",
      "Initial dashboard layout",
      "Core database structure",
    ],
  },
  {
    id: "2",
    date: "2024-11-15",
    title: "Tree Test Feature Release",
    description: "Added tree testing functionality to help evaluate information architecture.",
    type: "feature",
    details: [
      "Create and customize tree test studies",
      "Define tasks and expected paths",
      "Comprehensive results analysis",
      "Path analysis visualization",
      "Success metrics dashboard",
      "Share studies with collaborators",
    ],
  },
  {
    id: "3",
    date: "2025-02-10",
    title: "Development Update",
    description: "Hello everyone! I wanted to give you a quick update on the development status.",
    type: "message",
    details: [
      "I'm the sole developer working on this website, currently a graduating Computer Science student.",
      "I took a 2-month break to rest and focus on other academic commitments.",
      "I'm now back and excited to continue working on improving the platform!",
      "Thank you for using Usabilitree! Your continued use of the platform means a lot.",
      "I'll be using this Updates page to keep you informed of new features and changes.",
      "For any issues or suggestions, feel free to DM me on Discord: @pseudo1337",
      "Pro tip: If you're coming from UXTweak or Optimal Workshop, you can create your tree test there first, export to CSV, then copy-paste the structure here for easy setup!",
    ],
  },
  {
    id: "4",
    date: "2025-04-27",
    title: "Platform Improvements",
    description: "Various improvements and bug fixes to the tree test functionality",
    type: "improvement",
    details: [
      "Increased study limit to 7 (temporary, may change when pricing tiers are introduced)",
      "Fixed bug in tracking participant's path taken, causing incorrect Directness score calculation",
      "Improved tree test for participants, now tracks current task which allows them to resume when they reload or reopen the tab",
      "Improved notes and placeholder messages in tree tab setup",
      "Added tooltip to dashboard link for unsaved changes warning",
      "Added advisory note on deleting participant results",
      'Added "Back to top" button in tasks tab setup',
      'Added "Copy from Existing Study" button in general tab setup',
      "Optimized database queries",
    ],
  },
  {
    id: "5",
    date: "2025-05-11",
    title: "Time Tracking & UI Improvements",
    description: "Fixed participant time tracking and added more information",
    type: "fix",
    details: [
      "Fixed UI bug covering the Start Task button with the task description in the tree test.",
      "Fixed UI bug where tree test with single top-level item expands all children.",
      "Fixed participant's total time taken calculation. It now records active time instead of simply subtracting start and end timestamps.",
      "Added a 3-minute idle/inactivity timeout threshold that pauses active time recording.",
      "Added more information and tooltip notes to the Time column and Duration in participant modal.",
    ],
  },
  {
    id: "6",
    date: "2025-05-11",
    title: "Development Message",
    description: "Platform update plan and study limit increase",
    type: "message",
    details: [
      "Hello! I've added the fixes needed thanks to the users who reached out to me.",
      "I'm currently working on rewriting the whole site to improve UI, security, documentation, tree test data collection, and add card sorting tests.",
      "New improvements to the tree test will be part of that update but if there's a feature you need right away or a bug that needs fixing, please DM me on Discord (@pseudo1337) and I'll try to add it ASAP.",
      "I've increased the study limit to 7 while I work on the pricing tier update.",
      "If you need more studies, we can discuss this in DMs (charges may apply 😄).",
    ],
  },
  {
    id: "7",
    date: "2025-05-20",
    title: "Fixes and Improvements",
    description: "Fixes and improvements to existing features",
    type: "fix",
    details: [
      "Fixed UI bug in tree test where expanded items were not seen properly due to limited scrolling.",
    ],
  },
];

export function UpdatesList() {
  return (
    <div className="space-y-4">
      {[...updates].reverse().map((update) => (
        <Card key={update.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{update.title}</CardTitle>
              <Badge
                variant={
                  update.type === "feature"
                    ? "default"
                    : update.type === "improvement"
                      ? "secondary"
                      : update.type === "message"
                        ? "green"
                        : "outline"
                }
              >
                {update.type}
              </Badge>
            </div>
            <time className="text-sm text-muted-foreground">
              {new Date(update.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{update.description}</p>
            {update.details && (
              <ul className="ml-4 list-disc text-sm text-muted-foreground">
                {update.details.map((detail, index) => (
                  <li key={index} className="mt-1">
                    {detail}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
