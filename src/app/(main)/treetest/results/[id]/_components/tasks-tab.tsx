"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
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
import { BoxPlot } from "@/components/ui/box-plot";
import { Button } from "@/components/ui/button";
import { Item } from "@/lib/types/tree-test";

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

function TaskBreakdownPie({
  breakdown,
  score,
}: {
  breakdown: TaskStats["stats"]["breakdown"];
  score: number;
}) {
  const data = [
    {
      name: "Direct Success",
      value: breakdown.directSuccess,
      percentage: ((breakdown.directSuccess / breakdown.total) * 100).toFixed(),
      color: "bg-green-500",
    },
    {
      name: "Indirect Success",
      value: breakdown.indirectSuccess,
      percentage: ((breakdown.indirectSuccess / breakdown.total) * 100).toFixed(),
      color: "bg-green-300",
    },
    {
      name: "Direct Fail",
      value: breakdown.directFail,
      percentage: ((breakdown.directFail / breakdown.total) * 100).toFixed(),
      color: "bg-red-500",
    },
    {
      name: "Indirect Fail",
      value: breakdown.indirectFail,
      percentage: ((breakdown.indirectFail / breakdown.total) * 100).toFixed(),
      color: "bg-red-300",
    },
    {
      name: "Direct Skip",
      value: breakdown.directSkip,
      percentage: ((breakdown.directSkip / breakdown.total) * 100).toFixed(),
      color: "bg-gray-500",
    },
    {
      name: "Indirect Skip",
      value: breakdown.indirectSkip,
      percentage: ((breakdown.indirectSkip / breakdown.total) * 100).toFixed(),
      color: "bg-gray-300",
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Task Completion Breakdown</span>
        <span className="text-sm text-muted-foreground">Total Participants: {breakdown.total}</span>
      </div>
      <div className="flex items-center justify-center gap-8">
        <div className="h-48 w-48">
          <PieChart data={data} />
        </div>
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${item.color}`} />
              <span className="text-sm">
                {item.name}: {item.percentage}% ({item.value})
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-sm font-medium">Overall Score</span>
          <span className="text-4xl font-bold">{score}%</span>
        </div>
      </div>
    </div>
  );
}

function TimeStats({
  stats,
  maxTimeLimit,
}: {
  stats: TaskStats["stats"]["time"];
  maxTimeLimit?: number | null;
}) {
  const DEFAULT_MAX_TIME = 120; // 2 minutes in seconds
  const effectiveMaxTime = maxTimeLimit || DEFAULT_MAX_TIME;

  const boxPlotData = {
    min: stats.min,
    q1: stats.q1,
    median: stats.median,
    q3: stats.q3,
    max: stats.max,
    displayMax: effectiveMaxTime,
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Time Taken Distribution</span>
        <span className="text-sm text-muted-foreground">
          min: {formatTime(stats.min)} / max: {formatTime(stats.max)}
          {stats.max > effectiveMaxTime && " (truncated)"}
        </span>
      </div>
      <BoxPlot data={boxPlotData} formatLabel={formatTime} />
      <div className="text-center text-sm text-muted-foreground">
        Median: {formatTime(stats.median)}
      </div>
    </div>
  );
}

function FirstClickedParentTable({
  parentClicks,
}: {
  parentClicks: TaskStats["stats"]["parentClicks"];
}) {
  if (parentClicks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">First-Clicked Parent Labels</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Path</TableHead>
            <TableHead>Correct First Click</TableHead>
            <TableHead className="text-right">Clicked First</TableHead>
            <TableHead className="text-right">Clicked During Task</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parentClicks.map((click, index) => (
            <TableRow key={index}>
              <TableCell>
                <Breadcrumb>
                  <BreadcrumbList>
                    {click.path
                      .split("/")
                      .filter(Boolean)
                      .map((item, i) => (
                        <BreadcrumbItem key={i}>
                          {i > 0 && <ChevronRightIcon className="h-4 w-4" />}
                          {item}
                        </BreadcrumbItem>
                      ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </TableCell>
              <TableCell>
                {click.isCorrect ? (
                  <span className="text-green-500">Yes</span>
                ) : (
                  <span className="text-red-500">No</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {click.firstClickCount} ({click.firstClickPercentage}%)
              </TableCell>
              <TableCell className="text-right">
                {click.totalClickCount} ({click.totalClickPercentage}%)
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface ParticipantDestination {
  path: string;
  count: number;
  percentage: number;
}

interface ConfiguredPath extends ParticipantDestination {
  paths: {
    path: string;
    count: number;
  }[];
}

type Destination = ParticipantDestination | ConfiguredPath;

function IncorrectDestinationsTable({
  destinations,
  parsedTree,
}: {
  destinations: { path: string; count: number }[];
  parsedTree: string;
}) {
  const [showParticipantPaths, setShowParticipantPaths] = useState(false);
  const tree = JSON.parse(parsedTree) as Item[];

  if (destinations.length === 0) {
    return null;
  }

  const validLinks = new Map<string, string>();

  function collectLinks(nodes: Item[], currentPath: string = "") {
    nodes.forEach((node) => {
      if (node.link) {
        const finalSegment = node.link.split("/").pop()!;
        validLinks.set(finalSegment, node.link);
      }
      if (node.children?.length) {
        collectLinks(node.children, currentPath);
      }
    });
  }
  collectLinks(tree);

  const totalParticipants = destinations.reduce((sum, d) => sum + d.count, 0);

  const destinationsToShow: Destination[] = !showParticipantPaths
    ? Array.from(
        destinations
          .reduce((acc, dest) => {
            const finalSegment = dest.path.split("/").pop()!;
            const configuredPath = validLinks.get(finalSegment);

            if (configuredPath) {
              if (!acc.has(configuredPath)) {
                acc.set(configuredPath, {
                  path: configuredPath,
                  count: 0,
                  percentage: 0,
                  paths: [],
                });
              }
              const entry = acc.get(configuredPath)!;
              entry.count += dest.count;
              entry.paths.push(dest);
            }
            return acc;
          }, new Map<string, ConfiguredPath>())
          .values()
      )
        .map((dest) => ({
          ...dest,
          percentage: Math.round((dest.count / totalParticipants) * 100),
        }))
        .sort((a, b) => b.count - a.count)
    : destinations.map((dest) => ({
        path: dest.path,
        count: dest.count,
        percentage: Math.round((dest.count / totalParticipants) * 100),
      }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Incorrect Destinations</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowParticipantPaths(!showParticipantPaths)}
        >
          Show {!showParticipantPaths ? "Participant" : "Configured"} Paths
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Path Taken</TableHead>
            <TableHead className="text-right"># of Participants</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {destinationsToShow.map((destination, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Breadcrumb>
                    <BreadcrumbList>
                      {destination.path
                        .split("/")
                        .filter(Boolean)
                        .map((item, i) => (
                          <BreadcrumbItem key={i}>
                            {i > 0 && <ChevronRightIcon className="h-4 w-4" />}
                            {item}
                          </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                  {/* {!showParticipantPaths &&
                    "paths" in destination &&
                    destination.paths.length > 1 && (
                      <HoverCard>
                        <HoverCardTrigger>
                          <InfoCircledIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Participant Paths</h4>
                            <div className="text-sm text-muted-foreground">
                              <div className="mb-2">
                                Includes {destination.paths.length} different paths:
                              </div>
                              <ul className="list-disc space-y-1 pl-4">
                                {destination.paths.map((path, i) => (
                                  <li key={i}>
                                    {path.path}
                                    <span className="ml-1 text-xs">
                                      ({path.count} participant{path.count > 1 ? "s" : ""})
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )} */}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {destination.count} ({destination.percentage}%)
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
                      className="absolute left-0 top-0 h-full rounded-full bg-blue-bar"
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4 rounded-lg border px-6 py-4">
            {/* Task Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" /> {/* Task number */}
                <Skeleton className="h-5 w-64" /> {/* Task description */}
              </div>

              {/* Expected Answer Paths */}
              <div className="space-y-2">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" /> {/* CheckCircle icon */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-4" /> {/* Chevron */}
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" /> {/* Chevron */}
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
              <TaskBreakdownPie breakdown={task.stats.breakdown} score={task.stats.score} />
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
                  color="bg-green-bar"
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
                  color="bg-blue-bar"
                />
              </div>

              <TimeStats stats={task.stats.time} maxTimeLimit={task.maxTimeSeconds} />

              <div className="border-t pt-4">
                <FirstClickedParentTable parentClicks={task.stats.parentClicks} />
              </div>

              <div className="border-t pt-4">
                <IncorrectDestinationsTable
                  destinations={task.stats.incorrectDestinations}
                  parsedTree={task.parsedTree}
                />
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
