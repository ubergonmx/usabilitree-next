"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontalIcon, CheckCircledIcon, CrossCircledIcon } from "@/components/icons";
import { formatDistanceToNow } from "date-fns";
import { getParticipants, Participant } from "@/lib/treetest/results-actions";

export function ParticipantsTab({ studyId }: { studyId: string }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParticipants(studyId)
      .then(setParticipants)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studyId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
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
          {participants
            .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
            .map((participant, index) => {
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
                  <TableCell className="font-medium">Participant {index + 1}</TableCell>
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
                    {participant.completedAt
                      ? `${Math.round(
                          (participant.completedAt.getTime() - participant.startedAt.getTime()) /
                            1000 /
                            60
                        )} min`
                      : "-"}
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete Results
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}
