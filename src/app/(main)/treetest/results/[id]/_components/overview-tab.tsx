/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudyOverviewStats, TaskStats } from "@/lib/treetest/results-actions";
import { useEffect, useState } from "react";
import {
  UsersIcon,
  CircleCheckBigIcon,
  TimerIcon,
  TargetIcon,
  ChecklistIcon,
} from "@/components/icons";
import { TreeTestOverviewStats } from "@/lib/types/tree-test";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getTasksStats } from "@/lib/treetest/results-actions";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">Task {label}</span>
        </div>
        <div className="grid gap-1">
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex flex-1 items-center justify-between gap-2 leading-none"
            >
              <div className="flex items-center gap-1">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: entry.fill, borderColor: entry.fill }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="text-sm font-medium">{Number(entry.value).toFixed()}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }: any) => {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 py-2 sm:gap-3">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: entry.color, borderColor: entry.fill }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

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
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              <Skeleton className="h-5 w-40" />
            </CardTitle>
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
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

  const taskChartData = taskStats.map((task) => {
    const total = task.stats.breakdown.total;
    const calculatePercentage = (value: number) =>
      Math.min(Number(((value / total) * 100).toFixed(1)), 100);

    return {
      name: `${task.index + 1}`,
      "Direct Success": calculatePercentage(task.stats.breakdown.directSuccess),
      "Indirect Success": calculatePercentage(task.stats.breakdown.indirectSuccess),
      "Direct Fail": calculatePercentage(task.stats.breakdown.directFail),
      "Indirect Fail": calculatePercentage(task.stats.breakdown.indirectFail),
      "Direct Skip": calculatePercentage(task.stats.breakdown.directSkip),
      "Indirect Skip": calculatePercentage(task.stats.breakdown.indirectSkip),
    };
  });

  const labelColors = {
    "Direct Success": {
      label: "Direct Success",
      color: "hsl(var(--success))",
    },
    "Indirect Success": {
      label: "Indirect Success",
      color: "hsl(var(--indirect-success))",
    },
    "Direct Fail": {
      label: "Direct Fail",
      color: "hsl(var(--fail))",
    },
    "Indirect Fail": {
      label: "Indirect Fail",
      color: "hsl(var(--indirect-fail))",
    },
    "Direct Skip": {
      label: "Direct Skip",
      color: "hsl(var(--skipped))",
    },
    "Indirect Skip": {
      label: "Indirect Skip",
      color: "hsl(var(--indirect-skipped))",
    },
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Task Results Breakdown</CardTitle>
          <ChecklistIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={taskChartData}
                margin={{ top: 20, left: 10, right: 10 }}
              >
                <XAxis
                  type="number"
                  unit="%"
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tickFormatter={(value) => `${Math.min(value, 100)}`}
                />
                <YAxis type="category" dataKey="name" width={20} interval={0} />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Bar
                  dataKey="Direct Success"
                  stackId="a"
                  fill={labelColors["Direct Success"].color}
                  name="Direct Success"
                />
                <Bar
                  dataKey="Indirect Success"
                  stackId="a"
                  fill={labelColors["Indirect Success"].color}
                  name="Indirect Success"
                />
                <Bar
                  dataKey="Direct Fail"
                  stackId="a"
                  fill={labelColors["Direct Fail"].color}
                  name="Direct Fail"
                />
                <Bar
                  dataKey="Indirect Fail"
                  stackId="a"
                  fill={labelColors["Indirect Fail"].color}
                  name="Indirect Fail"
                />
                <Bar
                  dataKey="Direct Skip"
                  stackId="a"
                  fill={labelColors["Direct Skip"].color}
                  name="Direct Skip"
                />
                <Bar
                  dataKey="Indirect Skip"
                  stackId="a"
                  fill={labelColors["Indirect Skip"].color}
                  name="Indirect Skip"
                />
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
