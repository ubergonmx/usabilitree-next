"use client";

import {
  ArrowLeftIcon,
  SaveIcon,
  EyeOpenIcon,
  TrashIcon,
  RocketIcon,
  WorkflowIcon,
  GearIcon,
  FileTextIcon,
  ChecklistIcon,
  MessageSquareCodeIcon,
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
  getStudyDetails,
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [status, setStatus] = useState("draft");

  // Load initial data
  useEffect(() => {
    Promise.all([loadStudyData(params.id), getStudyDetails(params.id)])
      .then(([data, details]) => {
        setFormData(data);
        setStatus(details.status);
      })
      .catch((error) => {
        console.error("Failed to load study data:", error);
        toast.error("Failed to load study data");
      });
  }, [params.id]);

  // Check for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Detect unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  const canLaunchOrPreview = () => {
    return (
      formData.general.title?.trim() &&
      formData.tree.parsed.length > 0 &&
      formData.tasks.items.some((task) => task.description?.trim() && task.answer?.trim())
    );
  };

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
      setHasUnsavedChanges(false);
    }
  };

  const handleLaunch = async () => {
    if (!canLaunchOrPreview()) {
      toast.error("Please add a title, tree structure, and at least one task before launching");
      return;
    }

    if (hasUnsavedChanges) {
      setIsSaving(true);
      try {
        await saveStudyData(params.id, formData);
        toast.success("Study saved successfully");
      } catch (error) {
        console.error("Failed to save study:", error);
        toast.error("Failed to save study");
        return;
      } finally {
        setIsSaving(false);
        setHasUnsavedChanges(false);
      }
    }

    setIsLaunching(true);
    try {
      await updateStudyStatus(params.id, "active");
      const link = `${window.location.origin}/treetest/${params.id}`;
      await navigator.clipboard.writeText(link);
      toast.success("Study launched successfully and link copied to clipboard");
      router.push(`/treetest/results/${params.id}`);
    } catch (error) {
      console.error("Failed to launch study:", error);
      toast.error("Failed to launch study");
    } finally {
      setIsLaunching(false);
    }
  };

  const handlePreview = async () => {
    if (!canLaunchOrPreview()) {
      toast.error("Please add a title, tree structure, and at least one task before previewing");
      return;
    }

    if (hasUnsavedChanges) {
      setIsSaving(true);
      try {
        await saveStudyData(params.id, formData);
        toast.success("Study saved successfully");
      } catch (error) {
        console.error("Failed to save study:", error);
        toast.error("Failed to save study");
        return;
      } finally {
        setIsSaving(false);
        setHasUnsavedChanges(false);
      }
    }

    window.open(`/treetest/preview/${params.id}`, "_blank");
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
            {hasUnsavedChanges && (
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-theme"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-theme"></span>
              </span>
            )}
          </Button>

          {status === "draft" && (
            <AlertDialog>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={!canLaunchOrPreview()}
                asChild
              >
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
                  <AlertDialogAction
                    onClick={handleLaunch}
                    disabled={isLaunching || isSaving}
                    className="gap-2"
                  >
                    {isLaunching ? (
                      <>Launching...</>
                    ) : isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <RocketIcon className="h-4 w-4" /> Launch Study
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handlePreview}
            disabled={!canLaunchOrPreview() || isSaving}
          >
            <EyeOpenIcon className="h-4 w-4" />
            Preview
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
        <TabsList className="flex h-auto w-full flex-wrap items-center justify-start">
          <TabsTrigger value="general" className="gap-2">
            <GearIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="tree" className="gap-2">
            <FileTextIcon className="h-4 w-4" />
            Tree
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ChecklistIcon className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquareCodeIcon className="h-4 w-4" />
            Messages
          </TabsTrigger>
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
