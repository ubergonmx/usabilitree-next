"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Router } from "lucide-react";
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

interface Item {
  name: string;
  link?: string;
  children?: Item[];
}

const confidenceLevels = [
  { value: "strongly-disagree", label: "Strongly Disagree" },
  { value: "moderately-disagree", label: "Moderately Disagree" },
  { value: "slightly-disagree", label: "Slightly Disagree" },
  { value: "neutral", label: "Neutral" },
  { value: "slightly-agree", label: "Slightly Agree" },
  { value: "moderately-agree", label: "Moderately Agree" },
  { value: "strongly-agree", label: "Strongly Agree" },
];

interface TreeTestConfig {
  tree: Item[];
  tasks: {
    id: string;
    description: string;
    link: string;
  }[];
  requireConfidenceRating: boolean;
}

interface TreeTestProps {
  config: TreeTestConfig;
}

const Navigation = ({
  items,
  onSelect,
  resetKey,
}: {
  items: Item[];
  onSelect: (link: string) => void;
  resetKey: number;
}) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [selectedLink, setSelectedLink] = useState<string>();

  useEffect(() => {
    const initialExpanded: { [key: string]: boolean } = {};
    items.forEach((item) => {
      if (item.name === "Home" && (!item.children || item.children.length === 0)) {
        initialExpanded[item.name] = true;
      }
    });
    setExpanded(initialExpanded);
    setSelectedLink("");
  }, [resetKey, items]);

  const toggleExpand = (name: string | number) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLinkClick = (link: string) => {
    setSelectedLink(link);
  };

  const renderItems = (items: Item[], level = 0) => {
    return items.map((item) => (
      <div key={item.name} className={`${level > 0 ? "ml-4" : ""} mb-2`}>
        {item.children ? (
          <div>
            <button
              onClick={() => toggleExpand(item.name)}
              className="flex w-full items-center justify-between bg-gray-200 px-3 py-2 text-sm transition-colors duration-200 hover:bg-gray-300"
              aria-expanded={expanded[item.name]}
            >
              <span>{item.name}</span>
              {expanded[item.name] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded[item.name] ? "mt-2 max-h-[1000px]" : "max-h-0"}`}
            >
              {renderItems(item.children, level + 1)}
            </div>
          </div>
        ) : (
          <div
            className={`my-1 flex items-center justify-between p-2 transition-colors duration-200 ${
              item.link === selectedLink ? "bg-[#e6f3d8]" : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => handleLinkClick(item.link ?? "")}
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
    ));
  };

  return <div className="mt-4">{renderItems(items)}</div>;
};

interface Result {
  taskId: string;
  selectedLink?: string | null;
  duration?: number;
  confidenceLevel?: string | null;
  skipped?: boolean;
}

export function TreeTestComponent({ config }: TreeTestProps) {
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>();
  const [currentTask, setCurrentTask] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<string>();
  const [confidenceLevel, setConfidenceLevel] = useState<string>();

  const startTest = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleSelection = (link: string) => {
    setSelectedLink(link);
    setShowConfidenceModal(true);
  };

  const handleConfidenceSubmit = () => {
    const endTime = Date.now();
    const duration = (endTime - (startTime ?? endTime)) / 1000; // Convert to seconds
    console.log(`Link: ${selectedLink}, Confidence: ${confidenceLevel}`);

    setResults((prev) => [
      ...prev,
      {
        taskId: config.tasks[currentTask].id,
        selectedLink,
        duration,
        confidenceLevel,
      },
    ]);

    setShowConfidenceModal(false);
    setConfidenceLevel("");
    moveToNextTask();
  };

  const skipTask = () => {
    setResults((prev) => [...prev, { taskId: config.tasks[currentTask].id, skipped: true }]);
    moveToNextTask();
  };

  const moveToNextTask = () => {
    if (currentTask < config.tasks.length - 1) {
      setCurrentTask((prev) => prev + 1);
      setStarted(false);
      setResetKey((prev) => prev + 1);
    } else {
      setStarted(false);
    }
  };

  useEffect(() => {
    if (!started && results.length > 0 && currentTask === config.tasks.length) {
      console.log("Test completed. Results:", results);
    }
  }, [started, results, currentTask, config.tasks.length]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl bg-gray-100">
      <div className="fixed left-0 right-0 top-0 z-10 bg-white pt-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="ml-2 sm:ml-0">
            <h2 className="text-lg font-semibold">
              Task {currentTask + 1} of {config.tasks.length}
            </h2>
            <p className="mt-2">{config.tasks[currentTask].description}</p>
          </div>
          {started && (
            <button
              onClick={skipTask}
              className="mr-2 text-blue-600 underline hover:text-blue-800 sm:mr-0"
            >
              Skip task
            </button>
          )}
        </div>
        <div className="mt-4 h-1 bg-theme"></div>
      </div>
      <div className="mt-32 p-4">
        {!started ? (
          <Button onClick={startTest} className="mb-4 text-center">
            Start Task {currentTask + 1}
          </Button>
        ) : (
          <Navigation items={config.tree} onSelect={handleSelection} resetKey={resetKey} />
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
        onOpenChange={setShowConfidenceModal}
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
                <RadioGroupItem value={level.value} id={level.value} className="sr-only" />
                <Label
                  htmlFor={level.value}
                  className="flex cursor-pointer flex-col items-center space-y-2"
                >
                  <div
                    className={`h-4 w-4 rounded-full border ${
                      confidenceLevel === level.value
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
          <Button onClick={handleConfidenceSubmit} disabled={!confidenceLevel} className="mt-4">
            Submit and Continue
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
