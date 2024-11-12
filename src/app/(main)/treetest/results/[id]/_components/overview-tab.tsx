"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudyOverviewStats } from "@/lib/treetest/results-actions";
import { useEffect, useState } from "react";
import { UsersIcon, CircleCheckBigIcon, TimerIcon, TargetIcon } from "@/components/icons";

interface OverviewStats {
  totalParticipants: number;
  completedParticipants: number;
  medianCompletionTime: number;
  successRate: number;
  directnessRate: number;
}

export function OverviewTab({ studyId }: { studyId: string }) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
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
    return <div>Loading...</div>;
  }

  if (!stats) {
    return <div>Failed to load statistics</div>;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Study Overview</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedParticipants}</div>
            <p className="text-xs text-muted-foreground">out of {stats.totalParticipants} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Median Time</CardTitle>
            <TimerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.medianCompletionTime)}</div>
            <p className="text-xs text-muted-foreground">to complete study</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CircleCheckBigIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">tasks completed successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Directness</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.directnessRate}%</div>
            <p className="text-xs text-muted-foreground">found direct path to target</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
