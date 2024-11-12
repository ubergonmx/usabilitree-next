"use client";

import {
  ArrowLeftIcon,
  SaveIcon,
  EyeOpenIcon,
  TrashIcon,
  RocketIcon,
  WorkflowIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import Link from "next/link";
import {
  updateStudyStatus,
  deleteStudy,
  saveStudyData,
  loadStudyData,
} from "@/lib/treetest/actions";
import { useRouter } from "next/navigation";
import { GeneralTab } from "./general-tab";
import { TreeTab } from "./tree-tab";
import { TasksTab } from "./tasks-tab";
import { MessagesTab } from "./messages-tab";
import { StudyFormData } from "@/lib/types/tree-test";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface SetupTabsProps {
  params: {
    id: string;
  };
}

export default function SetupTabs({ params }: SetupTabsProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<StudyFormData>({
    general: {
      title: "",
      description: "",
    },
    tree: {
      structure: "",
      parsed: [],
    },
    tasks: {
      items: [],
    },
    messages: {
      welcome: "",
      completion: "",
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Load initial data
  useEffect(() => {
    loadStudyData(params.id)
      .then(setFormData)
      .catch((error) => {
        console.error("Failed to load study data:", error);
        toast.error("Failed to load study data");
      });
  }, [params.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveStudyData(params.id, formData);
      toast.success("Study saved successfully");
    } catch (error) {
      console.error("Failed to save study:", error);
      toast.error("Failed to save study");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      await updateStudyStatus(params.id, "active");
      toast.success("Study launched successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to launch study:", error);
      toast.error("Failed to launch study");
    } finally {
      setIsLaunching(false);
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
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <WorkflowIcon /> {formData.general.title || "Set up your Tree Test"}
          </h1>
          <p className="mt-2 text-muted-foreground">Configure your tree test study settings</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            <SaveIcon className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          <AlertDialog>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <AlertDialogTrigger>
                <RocketIcon className="h-4 w-4" /> Launch
              </AlertDialogTrigger>
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Launch Study?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will make your study live and available to participants. You won&apos;t be
                  able to modify it after launching.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLaunch} disabled={isLaunching} className="gap-2">
                  {isLaunching ? (
                    <>Launching...</>
                  ) : (
                    <>
                      <RocketIcon className="h-4 w-4" /> Launch Study
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              window.open(`/treetest/preview/${params.id}`, "_blank");
            }}
          >
            <EyeOpenIcon className="h-4 w-4" /> Preview
          </Button>

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
      </div>

      <Tabs defaultValue="general" className="mt-6 w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tree">Tree</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab data={formData} onChange={setFormData} />
        </TabsContent>

        <TabsContent value="tree">
          <TreeTab data={formData} onChange={setFormData} />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab data={formData} onChange={setFormData} />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesTab data={formData} onChange={setFormData} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
