"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTasksStats, type TaskStats } from "@/lib/treetest/results-actions";
import { ChevronRightIcon, CheckCircledIcon } from "@/components/icons";
import { PieChart } from "@/components/ui/pie-chart";

const confidenceLevels = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Moderately Disagree" },
  { value: 3, label: "Slightly Disagree" },
  { value: 4, label: "Neutral" },
  { value: 5, label: "Slightly Agree" },
  { value: 6, label: "Moderately Agree" },
  { value: 7, label: "Strongly Agree" },
];

function StatBar({ value, margin, color }: { value: number; margin?: number; color: string }) {
  return (
    <div className="relative h-8 w-full rounded-full bg-secondary">
      <div
        className={`absolute left-0 top-0 h-full rounded-full ${color}`}
        style={{ width: `${value}%` }}
      ></div>
      {!!margin && (
        <div
          className="absolute top-0 h-full border-l-2 border-r-2 border-foreground/20"
          style={{
            left: `${Math.max(0, value - margin)}%`,
            width: `${Math.min(100, margin * 2)}%`,
          }}
        ></div>
      )}

      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-medium text-foreground">
        {value}%
      </span>
    </div>
  );
}

function TaskBreakdownPie({ breakdown }: { breakdown: TaskStats["stats"]["breakdown"] }) {
  const data = [
    {
      name: "Direct Success",
      value: breakdown.directSuccess,
      color: "bg-green-500",
    },
    {
      name: "Indirect Success",
      value: breakdown.indirectSuccess,
      color: "bg-green-300",
    },
    {
      name: "Direct Fail",
      value: breakdown.directFail,
      color: "bg-red-500",
    },
    {
      name: "Indirect Fail",
      value: breakdown.indirectFail,
      color: "bg-red-300",
    },
    {
      name: "Direct Skip",
      value: breakdown.directSkip,
      color: "bg-gray-500",
    },
    {
      name: "Indirect Skip",
      value: breakdown.indirectSkip,
      color: "bg-gray-300",
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Task Completion Breakdown</span>
        <span className="text-sm text-muted-foreground">Total Participants: {breakdown.total}</span>
      </div>
      <div className="flex items-center gap-8">
        <div className="h-48 w-48">
          <PieChart data={data} />
        </div>
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${item.color}`} />
              <span className="text-sm">
                {item.name}: {((item.value / breakdown.total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfidenceRatingsTable({ ratings }: { ratings: TaskStats["stats"]["confidenceRatings"] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Confidence Ratings</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Answer</TableHead>
            <TableHead>Percentage</TableHead>
            <TableHead className="text-right">Frequency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {confidenceLevels.map((level) => {
            const rating = ratings.find((r) => r.value === level.value) || {
              value: level.value,
              count: 0,
              percentage: 0,
            };

            return (
              <TableRow key={level.value}>
                <TableCell>{level.label}</TableCell>
                <TableCell className="w-[300px]">
                  <div className="relative h-4 w-full rounded-full bg-secondary">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-blue-500"
                      style={{ width: `${rating.percentage}%` }}
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground">
                      {rating.percentage}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{rating.count}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function TasksTab({ studyId }: { studyId: string }) {
  const [tasks, setTasks] = useState<TaskStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasksStats(studyId);
        setTasks(data);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [studyId]);

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-4">
      {tasks.map((task, index) => (
        <AccordionItem key={task.id} value={task.id} className="rounded-lg border px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">Task {index + 1}</span>
                <h3 className="font-semibold">{task.description}</h3>
              </div>
              <div className="space-y-2">
                {task.expectedAnswer.split(",").map((answer, answerIndex) => (
                  <div key={answerIndex} className="flex items-center gap-2">
                    <CheckCircledIcon className="h-4 w-4 text-green-500" />
                    <Breadcrumb>
                      <BreadcrumbList>
                        {answer
                          .trim()
                          .split("/")
                          .map((item, i) => (
                            <BreadcrumbItem key={i}>
                              {i > 0 && <ChevronRightIcon className="h-4 w-4" />}
                              {item}
                            </BreadcrumbItem>
                          ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                ))}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-6">
              <TaskBreakdownPie breakdown={task.stats.breakdown} />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm text-muted-foreground">
                    ±{task.stats.success.margin}% margin of error
                  </span>
                </div>
                <StatBar
                  value={task.stats.success.rate}
                  margin={task.stats.success.margin}
                  color="bg-green-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Directness Score</span>
                  <span className="text-sm text-muted-foreground">
                    ±{task.stats.directness.margin}% margin of error
                  </span>
                </div>
                <StatBar
                  value={task.stats.directness.rate}
                  margin={task.stats.directness.margin}
                  color="bg-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Time Taken</span>
                  <span className="text-sm text-muted-foreground">
                    min: {formatTime(task.stats.time.min)} / max: {formatTime(task.stats.time.max)}
                  </span>
                </div>
                <div className="flex h-8 w-full items-center rounded-full bg-secondary px-4">
                  <span className="text-sm font-medium">
                    median: {formatTime(task.stats.time.median)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <span className="text-2xl font-bold">{task.stats.score}%</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <ConfidenceRatingsTable ratings={task.stats.confidenceRatings} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
