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
import { getTasksStats, type TaskStats } from "@/lib/treetest/results-actions";
import { ChevronRightIcon, CheckCircledIcon } from "@/components/icons";

function StatBar({ value, margin, color }: { value: number; margin?: number; color: string }) {
  return (
    <div className="relative h-8 w-full rounded-full bg-secondary">
      <div
        className={`absolute left-0 top-0 h-full rounded-full ${color}`}
        style={{ width: `${value}%` }}
      />
      {margin && (
        <div
          className="absolute top-0 h-full border-l-2 border-r-2 border-foreground/20"
          style={{
            left: `${Math.max(0, value - margin)}%`,
            width: `${Math.min(100, margin * 2)}%`,
          }}
        />
      )}
      <span className="absolute left-2 top-1/2 -translate-y-1/2 font-medium text-white">
        {value}%
      </span>
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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
                <div className="flex h-8 w-full items-center rounded-full bg-secondary px-2">
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
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
