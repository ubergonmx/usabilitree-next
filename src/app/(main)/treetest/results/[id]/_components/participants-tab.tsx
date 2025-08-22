"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontalIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  SearchIcon,
  XIcon,
} from "@/components/icons";
import { formatDistanceToNow } from "date-fns";
import {
  getParticipants,
  Participant,
  deleteTaskResult,
  deleteParticipant,
} from "@/lib/treetest/results-actions";
import { toast } from "sonner";
import { ParticipantDetailsModal } from "./participant-details-modal";
import * as Sentry from "@sentry/react";

// Extract Note component to reuse
const ParticipantsNote = () => (
  <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
    <p>
      Note: Participant numbers (e.g., &quot;Participant 1&quot;) are generated based on the order
      of creation time in the database. These numbers are for display purposes only and may change
      if earlier entries are deleted.
    </p>
    <p className="mt-2">
      If you see duplicate responses (e.g., &quot;A1&quot; meaning Attempt 1), you can delete the
      subsequent attempts. This may occur due to participants experiencing connectivity issues
      during the study.
    </p>
    <p className="mt-2 font-medium">
      It is advisable to only delete participant results after you&apos;ve set the study to
      Completed status.
    </p>
  </div>
);

interface ParticipantsTabProps {
  studyId: string;
  isOwner: boolean;
}

export function ParticipantsTab({ studyId, isOwner }: ParticipantsTabProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [deleteParticipantId, setDeleteParticipantId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getParticipants(studyId)
      .then(setParticipants)
      .catch(Sentry.captureException)
      .finally(() => setLoading(false));
  }, [studyId]);

  const handleDeleteParticipant = async (participantId: string) => {
    try {
      await deleteParticipant(participantId);
      const updatedParticipants = await getParticipants(studyId);
      setParticipants(updatedParticipants);
      toast.success("Participant deleted successfully");
    } catch (error) {
      toast.error("Failed to delete participant");
      Sentry.captureException(error);
    }
  };
  const handleDeleteResult = async (taskId: string, participantId: string) => {
    try {
      await deleteTaskResult(taskId);
      const updatedParticipants = await getParticipants(studyId);
      setParticipants(updatedParticipants);
      // Update selected participant if it's the one being viewed
      if (selectedParticipant?.id === participantId) {
        const updatedParticipant = updatedParticipants.find((p) => p.id === participantId);
        if (updatedParticipant) {
          setSelectedParticipant(updatedParticipant);
        }
      }
      toast.success("Task result deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task result");
      Sentry.captureException(error);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const searchLower = search.toLowerCase();

    // If search is a number, only match participant numbers
    if (/^\d+$/.test(search)) {
      return `participant ${p.participantNumber}`.includes(search);
    }

    // Otherwise search across all fields
    return (
      p.id.toLowerCase().includes(searchLower) ||
      p.sessionId.toLowerCase().includes(searchLower) ||
      `participant ${p.participantNumber}`.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <ParticipantsNote />
        <div className="relative max-w-sm">
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Table skeleton */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="flex h-[450px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">No participants yet</h3>
          <p className="text-sm text-muted-foreground">
            Share your study link to start collecting results
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 space-y-4">
        <ParticipantsNote />
        <div className="relative max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Search by Participant ID, Session ID, or Participant Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Directness</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants
              .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
              .map((participant) => {
                const taskStats = participant.taskResults.reduce(
                  (acc, result) => {
                    if (!result.skipped) {
                      acc.total++;
                      if (result.successful) acc.successful++;
                      if (result.directPathTaken) acc.direct++;
                    }
                    return acc;
                  },
                  { total: 0, successful: 0, direct: 0 }
                );

                const successRate = Math.round((taskStats.successful / taskStats.total) * 100);
                const directnessRate = Math.round((taskStats.direct / taskStats.total) * 100);

                return (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">
                      <div>Participant {participant.participantNumber}</div>
                      {participant.hasDuplicates && (
                        <div className="text-xs text-yellow-500">Has duplicate responses</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {participant.completedAt ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircledIcon className="h-4 w-4" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500">
                          <CrossCircledIcon className="h-4 w-4" />
                          <span>Abandoned</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(participant.startedAt, { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {participant.durationSeconds ? (
                        <span>{Math.round(participant.durationSeconds / 60)} min</span>
                      ) : participant.completedAt ? (
                        `${Math.round(
                          (participant.completedAt.getTime() - participant.startedAt.getTime()) /
                            1000 /
                            60
                        )} min`
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{successRate}%</TableCell>
                    <TableCell>{directnessRate}%</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedParticipant(participant)}>
                            View Details
                          </DropdownMenuItem>
                          {isOwner && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteParticipantId(participant.id)}
                            >
                              Delete Results
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
      {selectedParticipant && (
        <ParticipantDetailsModal
          participant={selectedParticipant}
          isOpen={!!selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
          onDeleteResult={handleDeleteResult}
          isOwner={isOwner}
        />
      )}
      {/* Delete Participant Confirmation */}
      <AlertDialog open={!!deleteParticipantId} onOpenChange={() => setDeleteParticipantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Participant Results</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all results for this participant? This action cannot
              be undone. It is advisable to only delete results after you&apos;ve set the study to
              Completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteParticipantId) {
                  await handleDeleteParticipant(deleteParticipantId);
                  setDeleteParticipantId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
