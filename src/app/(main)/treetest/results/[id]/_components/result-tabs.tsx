"use client";

import {
  ArrowLeftIcon,
  BarChartIcon,
  UsersIcon,
  ChecklistIcon,
  ShareIcon,
} from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { OverviewTab } from "./overview-tab";
// import { ParticipantsTab } from "./participants-tab";
// import { TasksTab } from "./tasks-tab";
import { SharingTab } from "./sharing-tab";

interface ResultTabsProps {
  params: {
    id: string;
  };
  userEmail: string;
  isOwner: boolean;
}

export default function ResultTabs({ params, userEmail, isOwner }: ResultTabsProps) {
  return (
    <main className="container min-h-[calc(100vh-160px)] pt-3 md:max-w-screen-md">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            href="/dashboard"
            className="mb-3 flex items-center gap-2 text-sm text-muted-foreground hover:underline"
          >
            <ArrowLeftIcon className="h-5 w-5" /> back to dashboard
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <BarChartIcon /> Study Results
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and analyze your tree test study results
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6 w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview" className="gap-2">
            <BarChartIcon className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="participants" className="gap-2">
            <UsersIcon className="h-4 w-4" /> Participants
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ChecklistIcon className="h-4 w-4" /> Tasks
          </TabsTrigger>
          <TabsTrigger value="sharing" className="gap-2">
            <ShareIcon className="h-4 w-4" /> Sharing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab studyId={params.id} />
        </TabsContent>
        {/*         
        <TabsContent value="participants">
          <ParticipantsTab studyId={params.id} />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab studyId={params.id} />
        </TabsContent> */}

        <TabsContent value="sharing">
          <SharingTab studyId={params.id} userEmail={userEmail} isOwner={isOwner} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
