"use client";

import {
  ArrowLeftIcon,
  BarChartIcon,
  UsersIcon,
  ChecklistIcon,
  ShareIcon,
  LinkIcon,
  CopyIcon,
  TrashIcon,
  FlagIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getStudyTitle, updateStudyStatus, deleteStudy } from "@/lib/treetest/actions";
import { OverviewTab } from "./overview-tab";
import { TasksTab } from "./tasks-tab";
import { SharingTab } from "./sharing-tab";

interface ResultTabsProps {
  params: {
    id: string;
  };
  userEmail: string;
  isOwner: boolean;
}

export default function ResultTabs({ params, userEmail, isOwner }: ResultTabsProps) {
  const router = useRouter();
  const [title, setTitle] = useState("Study Results");
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    getStudyTitle(params.id).then(setTitle).catch(console.error);
  }, [params.id]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/treetest/${params.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await updateStudyStatus(params.id, "completed");
      toast.success("Study marked as completed");
      router.refresh();
    } catch (error) {
      console.error("Failed to complete study:", error);
      toast.error("Failed to complete study");
    } finally {
      setIsFinishing(false);
    }
  };

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
          <div className="flex items-center gap-4">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <BarChartIcon /> {title}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => window.open(`/treetest/${params.id}`, "_blank")}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleCopyLink}>
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="mt-2 text-muted-foreground">
            View and analyze your tree test study results
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <AlertDialog>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <AlertDialogTrigger>
                  <FlagIcon className="h-4 w-4" /> Finish
                </AlertDialogTrigger>
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Finish Study?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark your study as completed. No more participants will be able to
                    take the test.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleFinish}
                    disabled={isFinishing}
                    className="gap-2"
                  >
                    {isFinishing ? (
                      <>Finishing...</>
                    ) : (
                      <>
                        <FlagIcon className="h-4 w-4" /> Finish Study
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <Button variant="ghost" size="sm" className="text-destructive" asChild>
                <AlertDialogTrigger>
                  <TrashIcon className="h-4 w-4" />
                </AlertDialogTrigger>
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Study?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your study and all
                    associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await deleteStudy(params.id);
                      router.push("/dashboard");
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete Study
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
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

        {/* <TabsContent value="participants">
          <ParticipantsTab studyId={params.id} />
        </TabsContent> */}

        <TabsContent value="tasks">
          <TasksTab studyId={params.id} />
        </TabsContent>

        <TabsContent value="sharing">
          <SharingTab studyId={params.id} userEmail={userEmail} isOwner={isOwner} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
