import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudyFormData, TreeNode } from "@/lib/types/tree-test";
import { PlusIcon, TrashIcon, CheckIcon } from "@/components/icons";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TasksTabProps {
  data: StudyFormData;
  onChange: (data: StudyFormData) => void;
}

export function TasksTab({ data, onChange }: TasksTabProps) {
  const [openPopover, setOpenPopover] = useState<number | null>(null);

  // Recursive function to get all available paths from the tree
  const getAllPaths = (nodes: TreeNode[], parentPath = ""): string[] => {
    let paths: string[] = [];
    nodes.forEach((node) => {
      const currentPath = `${parentPath}/${node.name.toLowerCase().replace(/\s+/g, "-")}`;
      if (node.link) {
        paths.push(node.link);
      }
      if (node.children) {
        paths = [...paths, ...getAllPaths(node.children, currentPath)];
      }
    });
    return paths;
  };

  const availablePaths = getAllPaths(data.tree.parsed);

  const addTask = () => {
    onChange({
      ...data,
      tasks: {
        items: [...data.tasks.items, { description: "", answer: "" }],
      },
    });
  };

  const deleteTask = (index: number) => {
    const newTasks = data.tasks.items.filter((_, i) => i !== index);
    onChange({
      ...data,
      tasks: { items: newTasks },
    });
  };

  const updateTask = (index: number, field: "description" | "answer", value: string) => {
    const newTasks = [...data.tasks.items];
    newTasks[index] = { ...newTasks[index], [field]: value };
    onChange({
      ...data,
      tasks: { items: newTasks },
    });
  };

  // Recursive function to check if a path exists in the tree
  const checkPathInTree = (nodes: TreeNode[], path: string): boolean => {
    for (const node of nodes) {
      if (node.link === path) return true;
      if (node.children && node.children.length > 0) {
        if (checkPathInTree(node.children, path)) return true;
      }
    }
    return false;
  };

  const validateAnswer = (index: number) => {
    const task = data.tasks.items[index];
    if (!task.answer) {
      toast.error("Please enter an answer path");
      return;
    }

    const answerPaths = task.answer.split(",").map((path) => path.trim());
    const validPaths = answerPaths.filter((path) => {
      const answerPath = path.startsWith("/") ? path : `/${path}`;
      return checkPathInTree(data.tree.parsed, answerPath);
    });

    if (validPaths.length > 0) {
      toast.success("Answer path(s) are valid!");
    } else {
      toast.error("No valid paths found in tree structure");
    }
  };

  const toggleTaskAnswer = (index: number, path: string) => {
    const currentAnswers = data.tasks.items[index].answer
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    let newAnswers: string[];

    if (currentAnswers.includes(path)) {
      // Remove the path if it's already selected
      newAnswers = currentAnswers.filter((p) => p !== path);
    } else {
      // Add the path if it's not selected
      newAnswers = [...currentAnswers, path];
    }

    // Update the task with the new comma-separated answers
    updateTask(index, "answer", newAnswers.join(", "));
  };

  return (
    <div className="space-y-6">
      {data.tasks.items.map((task, index) => (
        <div key={index} className="relative space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor={`task-${index}`} className="text-base font-medium">
              Task {index + 1}
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive/90"
              onClick={() => deleteTask(index)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`task-${index}`} className="text-sm text-muted-foreground">
              Description
            </Label>
            <Input
              id={`task-${index}`}
              value={task.description}
              onChange={(e) => updateTask(index, "description", e.target.value)}
              placeholder="Enter task description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`answer-${index}`} className="text-sm text-muted-foreground">
              Correct Answer(s)
            </Label>
            <div className="flex items-center gap-2">
              <Popover
                open={openPopover === index}
                onOpenChange={(open) => setOpenPopover(open ? index : null)}
              >
                <PopoverTrigger asChild>
                  <div className="flex-1">
                    <Input
                      id={`answer-${index}`}
                      value={task.answer}
                      onChange={(e) => updateTask(index, "answer", e.target.value)}
                      placeholder="Enter paths (e.g., /home/products, /products)"
                      className={cn(
                        "w-full",
                        !task.answer
                          .split(",")
                          .some((path) => availablePaths.includes(path.trim())) &&
                          task.answer &&
                          "border-yellow-500"
                      )}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search paths..." />
                    <CommandList>
                      <CommandEmpty>No paths found.</CommandEmpty>
                      <CommandGroup>
                        {availablePaths.map((path) => {
                          const isSelected = task.answer
                            .split(",")
                            .map((p) => p.trim())
                            .includes(path);

                          return (
                            <CommandItem
                              key={path}
                              value={path}
                              onSelect={() => {
                                toggleTaskAnswer(index, path);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {isSelected && <CheckIcon className="h-4 w-4" />}
                                <span className={cn(isSelected && "font-medium")}>{path}</span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="default"
                className="gap-2 whitespace-nowrap"
                onClick={() => validateAnswer(index)}
              >
                <CheckIcon className="h-4 w-4" /> Check Answer
              </Button>
            </div>
            {task.answer &&
              !task.answer.split(",").some((path) => availablePaths.includes(path.trim())) && (
                <p className="text-sm text-yellow-500">
                  Warning: None of the paths are in the tree structure
                </p>
              )}
          </div>
        </div>
      ))}

      <Button onClick={addTask} variant="outline" className="gap-2">
        <PlusIcon className="h-4 w-4" /> Add Task
      </Button>
    </div>
  );
}
