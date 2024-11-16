"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudyOverviewStats, TaskStats } from "@/lib/treetest/results-actions";
import { useEffect, useState } from "react";
import { UsersIcon, CircleCheckBigIcon, TimerIcon, TargetIcon } from "@/components/icons";
import { TreeTestOverviewStats } from "@/lib/types/tree-test";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getTasksStats } from "@/lib/treetest/results-actions";

export function OverviewTab({ studyId }: { studyId: string }) {
  const [stats, setStats] = useState<TreeTestOverviewStats | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [overviewData, tasksData] = await Promise.all([
          getStudyOverviewStats(studyId),
          getTasksStats(studyId),
        ]);
        setStats(overviewData);
        setTaskStats(tasksData);
      } catch (error) {
        console.error("Failed to load overview stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [studyId]);

  const taskChartData = taskStats.map((task) => {
    const total = task.stats.breakdown.total;
    return {
      name: `Task ${task.index + 1}`,
      "Direct Success": (task.stats.breakdown.directSuccess / total) * 100,
      "Indirect Success": (task.stats.breakdown.indirectSuccess / total) * 100,
      "Direct Fail": (task.stats.breakdown.directFail / total) * 100,
      "Indirect Fail": (task.stats.breakdown.indirectFail / total) * 100,
      "Direct Skip": (task.stats.breakdown.directSkip / total) * 100,
      "Indirect Skip": (task.stats.breakdown.indirectSkip / total) * 100,
    };
  });

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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Task Results Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={taskChartData}
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" unit="%" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={60} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
                  labelStyle={{ fontWeight: 500 }}
                />
                <Legend />
                <Bar dataKey="Direct Success" stackId="a" fill="#22c55e" name="Direct Success" />
                <Bar
                  dataKey="Indirect Success"
                  stackId="a"
                  fill="#86efac"
                  name="Indirect Success"
                />
                <Bar dataKey="Direct Fail" stackId="a" fill="#ef4444" name="Direct Fail" />
                <Bar dataKey="Indirect Fail" stackId="a" fill="#fca5a5" name="Indirect Fail" />
                <Bar dataKey="Direct Skip" stackId="a" fill="#eab308" name="Direct Skip" />
                <Bar dataKey="Indirect Skip" stackId="a" fill="#fde047" name="Indirect Skip" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Shows the percentage breakdown of participant results for each task. Direct means the
            participant reached their destination without backtracking.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
