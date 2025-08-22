import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyIcon, LoaderIcon } from "@/components/icons";
import { getExistingStudies, loadStudyData } from "@/lib/treetest/actions";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { StudyFormData } from "@/lib/types/tree-test";

interface CopyStudyDialogProps {
  studyId: string;
  onCopyStudy: (data: StudyFormData) => void;
}

export function CopyStudyDialog({ studyId, onCopyStudy }: CopyStudyDialogProps) {
  const [studies, setStudies] = useState<
    {
      id: string;
      title: string;
      taskCount: number;
      updatedAt: Date;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadStudies = async () => {
    try {
      setLoading(true);
      const data = await getExistingStudies(studyId);
      setStudies(data);
    } catch (error) {
      toast.error("Failed to load studies");
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyStudy = async (sourceStudyId: string) => {
    try {
      setLoading(true);
      const studyData = await loadStudyData(sourceStudyId);
      onCopyStudy(studyData);
      setOpen(false);
      toast.success("Study copied successfully");
    } catch (error) {
      toast.error("Failed to copy study");
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (newOpen) loadStudies();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CopyIcon className="h-4 w-4" />
          Copy from Existing Study
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Copy from Existing Study</DialogTitle>
          <DialogDescription>
            Select a study to copy its entire configuration (general settings, tree structure,
            tasks, and messages)
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <LoaderIcon className="h-6 w-6 animate-spin" />
          </div>
        ) : studies.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-medium">No studies found</h3>
              <p className="text-sm text-muted-foreground">Create other studies first</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Study Title</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studies.map((study) => (
                <TableRow key={study.id}>
                  <TableCell className="font-medium">{study.title}</TableCell>
                  <TableCell>{study.taskCount} tasks</TableCell>
                  <TableCell>{formatDistanceToNow(study.updatedAt, { addSuffix: true })}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleCopyStudy(study.id)}
                    >
                      <CopyIcon className="h-4 w-4" />
                      Copy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
