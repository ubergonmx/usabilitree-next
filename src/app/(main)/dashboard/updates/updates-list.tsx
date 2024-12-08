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
];

export function UpdatesList() {
  return (
    <div className="space-y-4">
      {updates.map((update) => (
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
