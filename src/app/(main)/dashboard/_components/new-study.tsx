"use client";

import { FilePlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { createStudy } from "@/lib/treetest/actions";

interface NewPostProps {
  isEligible: boolean;
}

export const NewStudy = ({ isEligible }: NewPostProps) => {
  const router = useRouter();
  const [isCreatePending, startCreateTransaction] = React.useTransition();
  const [showDialog, setShowDialog] = React.useState(false);

  const createPost = (type: "tree_test" | "card_sort") => {
    if (!isEligible) {
      toast.message("You've reached the limit of posts for your current plan", {
        description: "Upgrade to create more posts",
      });
      return;
    }

    startCreateTransaction(async () => {
      try {
        const { id } = await createStudy(type);
        toast.success("Study created successfully");

        // Navigate to the setup page for tree tests
        if (type === "tree_test") {
          router.push(`/treetest/setup/${id}`);
        } else {
          // For future card sort implementation
          router.push("/dashboard");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Failed to create study");
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className="flex h-full cursor-pointer items-center justify-center bg-card p-6 text-muted-foreground transition-colors hover:bg-secondary/10 dark:border-none dark:bg-secondary/30 dark:hover:bg-secondary/50"
        disabled={isCreatePending}
      >
        <div className="flex flex-col items-center gap-4">
          <FilePlusIcon className="h-10 w-10" />
          <p className="text-sm">New Study</p>
        </div>
      </Button>

      <StudyTypeDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSelect={(type) => {
          setShowDialog(false);
          createPost(type);
        }}
      />
    </>
  );
};

interface StudyTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: "tree_test" | "card_sort") => void;
}

function StudyTypeDialog({ open, onOpenChange, onSelect }: StudyTypeDialogProps) {
  const [selectedType, setSelectedType] = React.useState<"tree_test" | "card_sort">("tree_test");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Study Type</DialogTitle>
          <DialogDescription>Select the type of study you want to create.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup
            className="flex justify-between"
            defaultValue="tree_test"
            onValueChange={(value) => setSelectedType(value as "tree_test" | "card_sort")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tree_test" id="tree_test" />
              <Label htmlFor="tree_test">Tree Test</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card_sort" id="card_sort" disabled />
              <Label htmlFor="card_sort" className="text-muted-foreground">
                Card Sort (coming soon)
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button onClick={() => onSelect(selectedType)}>Create Study</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
