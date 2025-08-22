"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { storeTreeTaskResult } from "@/lib/treetest/actions";
import { useRouter } from "next/navigation";
import { sanitizeTreeTestLink } from "@/lib/utils";
import { Item, ItemWithExpanded, TreeTestConfig } from "@/lib/types/tree-test";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "./icons";
import * as Sentry from "@sentry/react";

const confidenceLevels = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Moderately Disagree" },
  { value: 3, label: "Slightly Disagree" },
  { value: 4, label: "Neutral" },
  { value: 5, label: "Slightly Agree" },
  { value: 6, label: "Moderately Agree" },
  { value: 7, label: "Strongly Agree" },
];

interface TreeTestProps {
  config: TreeTestConfig;
  initialTaskIndex?: number;
  onTaskChange?: (taskIndex: number) => void;
}

interface NavigationProps {
  items: Item[];
  onSelect: (link: string) => void;
  resetKey: number;
  setPathTaken: Dispatch<SetStateAction<string>>;
}

const Navigation = ({ items, onSelect, resetKey, setPathTaken }: NavigationProps) => {
  const [treeState, setTreeState] = useState<ItemWithExpanded[]>([]);
  const [selectedLink, setSelectedLink] = useState<string>();

  useEffect(() => {
    // Check if there's only one root item containing "Home"
    const isOnlyRootHome = items.length === 1;
    // && items[0].name.toLowerCase().includes("home");
    const initialRootLink = isOnlyRootHome ? "/" + sanitizeTreeTestLink(items[0].name) : "";

    // Initialize tree with expansion states
    const initializeTree = (items: Item[], level: number = 0): ItemWithExpanded[] => {
      return items.map((item) => ({
        ...item,
        isExpanded: isOnlyRootHome && level === 0,
        children: item.children ? initializeTree(item.children, level + 1) : undefined,
      }));
    };

    setTreeState(initializeTree(items));
    setSelectedLink("");
    setPathTaken(initialRootLink);
  }, [resetKey, items, setPathTaken]);

  const updatePathTaken = (prev: string, name: string) => {
    const sanitizedPath = sanitizeTreeTestLink(name);
    const newPath = `${prev}/${sanitizedPath}`;
    return prev.endsWith(`/${sanitizedPath}`) ? prev : newPath;
  };

  const toggleExpand = (path: string[]) => {
    setSelectedLink(undefined);

    setTreeState((prevState) => {
      const newState = [...prevState];

      // Helper function to update expansion states
      const updateExpansion = (items: Item[], currentPath: string[]): Item[] => {
        return items.map((item: ItemWithExpanded) => {
          if (!item.children) return item;

          const isTargetPath = currentPath[0] === item.name;

          if (isTargetPath) {
            // If this is the target item
            if (currentPath.length === 1) {
              // Close all other branches at this level
              const otherItemsClosed = items.map((otherItem) => ({
                ...otherItem,
                isExpanded: otherItem.name === item.name ? !item.isExpanded : false,
                children: otherItem.children ? updateExpansion(otherItem.children, []) : undefined,
              }));
              return otherItemsClosed.find((i) => i.name === item.name)!;
            } else {
              // Continue down the path
              return {
                ...item,
                isExpanded: true,
                children: updateExpansion(item.children, currentPath.slice(1)),
              };
            }
          }

          // Close this branch if it's not in the path
          return {
            ...item,
            isExpanded: false,
            children: item.children ? updateExpansion(item.children, []) : undefined,
          };
        });
      };

      return updateExpansion(newState, path);
    });

    setPathTaken((prev) => updatePathTaken(prev, path[path.length - 1]));
  };

  const handleLinkClick = (link: string, name: string) => {
    setSelectedLink(link);
    setPathTaken((prev) => updatePathTaken(prev, name));
  };

  const renderItems = (items: ItemWithExpanded[], parentPath: string[] = []) => {
    return items.map((item) => {
      const currentPath = [...parentPath, item.name];

      return (
        <div key={item.name} className={`${parentPath.length ? "ml-4" : ""} mb-2`}>
          {item.children ? (
            <div>
              <button
                onClick={() => toggleExpand(currentPath)}
                className="flex w-full items-center justify-between bg-gray-200 px-3 py-2 text-sm transition-colors duration-200 hover:bg-gray-300"
                aria-expanded={item.isExpanded}
              >
                <span>{item.name}</span>
                {item.isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  item.isExpanded ? "mt-2 grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">{renderItems(item.children, currentPath)}</div>
              </div>
            </div>
          ) : (
            <div
              className={`my-1 flex items-center justify-between p-2 transition-colors duration-200 ${
                item.link === selectedLink ? "bg-[#e6f3d8]" : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => handleLinkClick(item.link ?? "", item.name)}
            >
              <span className="text-sm">{item.name}</span>
              {item.link === selectedLink && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-[#72FFA4] text-black hover:bg-[#00D9C2]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item.link ?? "");
                  }}
                >
                  I&apos;d find it here
                </Button>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return <div className="mt-4">{renderItems(treeState)}</div>;
};

// interface Result {
//   taskId: string;
//   selectedLink?: string | null;
//   duration?: number;
//   confidenceLevel?: string | null;
//   skipped?: boolean;
// }

export function TreeTestComponent({ config, initialTaskIndex = 0, onTaskChange }: TreeTestProps) {
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>();
  const [currentTask, setCurrentTask] = useState(initialTaskIndex);
  // const [results, setResults] = useState<Result[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<string>();
  const [confidenceLevel, setConfidenceLevel] = useState<string>();
  const [pathTaken, setPathTaken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Call onTaskChange when currentTask changes
  useEffect(() => {
    if (onTaskChange) {
      onTaskChange(currentTask);
    }
  }, [currentTask, onTaskChange]);

  useEffect(() => {
    // Scroll to top once the page is loaded
    scrollToTop();
  }, []);

  const startTest = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleSelection = (link: string) => {
    setSelectedLink(link);
    setShowConfidenceModal(true);
  };

  const handleConfidenceSubmit = async () => {
    if (!selectedLink || isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (!config.preview && config.participantId) {
        const endTime = Date.now();
        const duration = (endTime - startTime!) / 1000;

        // Check if the selected link matches any of the correct answers
        const correctAnswers = config.tasks[currentTask].link.split(",").map((a) => a.trim());
        const isSuccessful = correctAnswers.includes(selectedLink);

        await storeTreeTaskResult(config.participantId, config.tasks[currentTask].id, {
          successful: isSuccessful,
          directPathTaken: selectedLink === pathTaken,
          completionTimeSeconds: duration,
          confidenceRating: confidenceLevel ? parseInt(confidenceLevel) : undefined,
          pathTaken: pathTaken,
          skipped: false,
        });
      } else {
        // simulate the storeTreeTaskResult function with delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // setResults((prev) => [
      //   ...prev,
      //   {
      //     taskId: config.tasks[currentTask].id,
      //     selectedLink,
      //     duration: (Date.now() - (startTime ?? Date.now())) / 1000,
      //     confidenceLevel,
      //   },
      // ]);

      setShowConfidenceModal(false);
      setConfidenceLevel(undefined);
      setSelectedLink(undefined);
      moveToNextTask();
    } catch (error) {
      toast("Error submitting task result", {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
      Sentry.captureException(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipTask = async () => {
    if (!config.preview && config.participantId) {
      const endTime = Date.now();
      const duration = (endTime - startTime!) / 1000;

      const isOnlyRootHome = config.tree.length === 1;
      //&& config.tree[0].name.toLowerCase().includes("home");
      const rootLink = isOnlyRootHome ? sanitizeTreeTestLink(config.tree[0].name) : "";

      await storeTreeTaskResult(config.participantId, config.tasks[currentTask].id, {
        successful: false,
        directPathTaken: !pathTaken || pathTaken === `/${rootLink}`, // true if user didn't touch the nav menu = no path taken (direct skip)
        completionTimeSeconds: duration,
        pathTaken: pathTaken !== `/${rootLink}` ? pathTaken : "",
        skipped: true,
      });
    }

    //setResults((prev) => [...prev, { taskId: config.tasks[currentTask].id, skipped: true }]);
    moveToNextTask();
  };

  const moveToNextTask = () => {
    if (currentTask < config.tasks.length - 1) {
      setCurrentTask((prev) => prev + 1);
      setStarted(false);
      setResetKey((prev) => prev + 1);
      setStartTime(undefined);
      setPathTaken("");
      scrollToTop();
    } else {
      router.push("completed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100">
      {!config.tree || config.tree.length === 0 || !config.tasks || config.tasks.length === 0 ? (
        <>
          <div className="h-1 w-full bg-theme"></div>
          <div className="flex flex-col items-center justify-center pt-20">
            <h2 className="text-lg font-semibold">No Tree Structure or Tasks Found</h2>
            <p className="mt-2 text-center">
              It seems that there are no trees or tasks available for this study. Please go back to
              the setup and ensure that you have added a tree structure and at least one task.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="sticky left-0 right-0 top-0 z-10 w-full bg-white pt-3 shadow-sm sm:pt-4">
            <div className="mx-auto w-full max-w-3xl items-start justify-between px-4 sm:px-6 md:flex">
              <div className="pr-2">
                <h2 className="text-base font-semibold sm:text-lg">
                  Task {currentTask + 1} of {config.tasks.length}{" "}
                  {config.preview ? "(Preview)" : ""}
                </h2>
                <div className="text-mt-2 max-h-[30vh] overflow-y-auto pr-2 text-sm sm:text-base">
                  <p>
                    {config.tasks[currentTask].description ??
                      "[Error occurred - please report this to the study administrator]"}
                  </p>
                </div>
              </div>
              {started && (
                <button
                  onClick={skipTask}
                  className="mt-3 shrink-0 text-sm text-blue-600 underline hover:text-blue-800 sm:text-base md:mt-1"
                >
                  Skip task
                </button>
              )}
            </div>
            <div className="mt-2 h-1 w-full bg-theme sm:mt-4"></div>
          </div>

          <div className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
            {!started ? (
              <div className="flex justify-center">
                <Button onClick={startTest} className="mb-4 text-center">
                  Start Task {currentTask + 1}
                </Button>
              </div>
            ) : (
              <Navigation
                items={config.tree}
                onSelect={handleSelection}
                resetKey={resetKey}
                setPathTaken={setPathTaken}
              />
            )}
            {!started && currentTask === config.tasks.length && (
              <div className="mt-4">
                <h2 className="mb-2 text-lg font-semibold">Test Completed</h2>
                <p>Check the console for results.</p>
              </div>
            )}
          </div>
          <Dialog
            open={showConfidenceModal && config.requireConfidenceRating}
            onOpenChange={(open) => {
              if (!isSubmitting) {
                setShowConfidenceModal(open);
              }
            }}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>How confident are you with your answer?</DialogTitle>
                <DialogDescription>Please select your level of confidence:</DialogDescription>
              </DialogHeader>
              <RadioGroup
                value={confidenceLevel}
                onValueChange={setConfidenceLevel}
                className="grid grid-cols-7 gap-2 pt-4"
              >
                {confidenceLevels.map((level, index) => (
                  <div key={level.value} className="flex flex-col items-center">
                    <RadioGroupItem
                      value={level.value.toString()}
                      id={level.value.toString()}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={level.value.toString()}
                      className="flex cursor-pointer flex-col items-center space-y-2"
                    >
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          confidenceLevel === level.value.toString()
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      />
                      <span className="text-center text-xs">{index + 1}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="mt-2 flex justify-between text-xs">
                <span>{confidenceLevels[0].label}</span>
                <span>{confidenceLevels[6].label}</span>
              </div>
              <Button
                onClick={handleConfidenceSubmit}
                disabled={!confidenceLevel || isSubmitting}
                className="mt-4"
              >
                {isSubmitting ? "Submitting..." : "Submit and Continue"}
              </Button>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
