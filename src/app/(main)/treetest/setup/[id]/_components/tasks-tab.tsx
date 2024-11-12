import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudyFormData, TreeNode } from "./types";
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

    const answerPath = task.answer.startsWith("/") ? task.answer : `/${task.answer}`;
    const isValid = checkPathInTree(data.tree.parsed, answerPath);

    if (isValid) {
      toast.success("Answer path is valid!");
    } else {
      toast.error("Answer path not found in tree structure");
    }
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
              Correct Answer (path)
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
                      placeholder="Enter path (e.g., /home/products)"
                      className={cn(
                        "w-full",
                        !availablePaths.includes(task.answer) && task.answer && "border-yellow-500"
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
                        {availablePaths.map((path) => (
                          <CommandItem
                            key={path}
                            value={path}
                            onSelect={() => {
                              updateTask(index, "answer", path);
                              setOpenPopover(null);
                            }}
                          >
                            {path}
                          </CommandItem>
                        ))}
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
            {task.answer && !availablePaths.includes(task.answer) && (
              <p className="text-sm text-yellow-500">
                Warning: This path is not in the tree structure
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
