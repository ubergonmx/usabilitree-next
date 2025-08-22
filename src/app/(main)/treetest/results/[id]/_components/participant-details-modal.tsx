"use client";

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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon, CheckCircledIcon, CrossCircledIcon } from "@/components/icons";
import { format } from "date-fns";
import { Fragment, useState } from "react";
import { Participant } from "@/lib/treetest/results-actions";

interface ParticipantDetailsProps {
  participant: Participant;
  isOpen: boolean;
  onClose: () => void;
  onDeleteResult: (taskId: string, participantId: string) => Promise<void>;
  isOwner: boolean;
}

export function ParticipantDetailsModal({
  participant,
  isOpen,
  onClose,
  onDeleteResult,
  isOwner,
}: ParticipantDetailsProps) {
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="flex max-h-[90vh] max-w-6xl flex-col gap-0 p-0"
          onOpenAutoFocus={(event) => event.preventDefault()} // fix to Tooltip automatically appearing
        >
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Participant {participant.participantNumber} Details</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-6">
              {/* Participant Info */}
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Participant ID</p>
                  <p className="font-mono text-sm">{participant.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session ID</p>
                  <p className="font-mono text-sm">{participant.sessionId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Started At</p>
                  <p className="text-sm">{format(participant.startedAt, "PPP 'at' pp")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {participant.completedAt ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircledIcon className="h-4 w-4" />
                      <span>Completed at {format(participant.completedAt, "pp")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500">
                      <CrossCircledIcon className="h-4 w-4" />
                      <span>Abandoned</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed At</p>
                  <p className="text-sm">
                    {participant.completedAt
                      ? format(participant.completedAt, "PPP 'at' pp")
                      : "Not completed"}
                  </p>
                </div>
                <div>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-sm">
                            {participant.durationSeconds
                              ? `${participant.durationSeconds}s`
                              : "N/A"}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>
                          The total active time of the user from the moment they visited the task
                          page (not the welcome nor the instruction page) until they completed it.
                          This isn&apos;t the sum of all their tasks time as you can see in the
                          table.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {/* Task Results Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Task #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Path Taken</TableHead>
                      <TableHead>
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger className="text-left font-medium">Time</TooltipTrigger>
                            <TooltipContent side="top">
                              <p>
                                This is the duration from the moment they clicked the button
                                &quot;Start task&quot;
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                      <TableHead>Direct Path</TableHead>
                      <TableHead>Completed At</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(
                      participant.taskResults.reduce(
                        (acc, result) => {
                          if (!acc[result.taskIndex]) {
                            acc[result.taskIndex] = [];
                          }
                          acc[result.taskIndex].push(result);
                          return acc;
                        },
                        {} as Record<number, typeof participant.taskResults>
                      )
                    )
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([taskIndex, results]) => (
                        <Fragment key={taskIndex}>
                          {results.map((result, attemptIndex) => (
                            <TableRow key={result.id}>
                              <TableCell>
                                <TooltipProvider delayDuration={300}>
                                  <Tooltip>
                                    <TooltipTrigger className="text-left">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-medium">T{result.taskIndex + 1}</span>
                                        {results.length > 1 && (
                                          <span className="text-sm text-purple-500">
                                            (A{attemptIndex + 1})
                                          </span>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                      <p className="max-w-xs">{result.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell>
                                {result.skipped ? (
                                  <div className="flex items-center gap-2 text-yellow-500">
                                    <CrossCircledIcon className="h-4 w-4" />
                                    <span>Skipped</span>
                                  </div>
                                ) : result.successful ? (
                                  <div className="flex items-center gap-2 text-green-500">
                                    <CheckCircledIcon className="h-4 w-4" />
                                    <span>Success</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-red-500">
                                    <CrossCircledIcon className="h-4 w-4" />
                                    <span>Failed</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {result.pathTaken || "-"}
                              </TableCell>
                              <TableCell>{result.completionTimeSeconds}s</TableCell>
                              <TableCell>
                                {result.directPathTaken ? (
                                  <span className="text-green-500">Yes</span>
                                ) : (
                                  <span className="text-red-500">No</span>
                                )}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                {format(new Date(Number(result.createdAt) / 1000), "PP p")}
                              </TableCell>
                              <TableCell>
                                {isOwner ? (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontalIcon className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => setDeleteTaskId(result.id)}
                                      >
                                        Delete Result
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                ) : null}
                              </TableCell>
                            </TableRow>
                          ))}
                        </Fragment>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Task Result Confirmation */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task Result</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task result? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTaskId) {
                  await onDeleteResult(deleteTaskId, participant.id);
                  setDeleteTaskId(null);
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
