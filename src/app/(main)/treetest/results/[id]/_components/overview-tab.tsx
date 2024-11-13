"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudyOverviewStats } from "@/lib/treetest/results-actions";
import { useEffect, useState } from "react";
import { UsersIcon, CircleCheckBigIcon, TimerIcon, TargetIcon } from "@/components/icons";
import { TreeTestOverviewStats } from "@/lib/types/tree-test";

export function OverviewTab({ studyId }: { studyId: string }) {
  const [stats, setStats] = useState<TreeTestOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getStudyOverviewStats(studyId);
        setStats(data);
      } catch (error) {
        console.error("Failed to load overview stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [studyId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Study Overview</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load statistics</div>;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Study Overview</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold">
              {stats.completedParticipants} of {stats.totalParticipants} ({stats.completionRate}%)
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.completedParticipants}{" "}
              {stats.completedParticipants > 1 ? "participants" : "participant"} completed your
              study, {stats.abandonedParticipants} abandoned.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Taken</CardTitle>
            <TimerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold">{formatTime(stats.medianCompletionTime)}</div>
            <p className="text-sm text-muted-foreground">
              It took your participants a median time of {formatTime(stats.medianCompletionTime)} to
              complete the study. The longest time was {formatTime(stats.longestCompletionTime)} and
              the shortest was {formatTime(stats.shortestCompletionTime)}.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CircleCheckBigIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-sm text-muted-foreground">
              This shows the average success score across all your tasks. Out of all the tasks
              completed by participants, {stats.successRate}% ended up at a &quot;correct&quot;
              destination.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Directness Score</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold">{stats.directnessRate}%</div>
            <p className="text-sm text-muted-foreground">
              This shows the average directness score across all your tasks. Out of all the tasks
              completed by participants, {stats.directnessRate}% of destinations were chosen without
              backtracking.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
