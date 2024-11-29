"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Card } from "@/components/ui/card";
import { loadWelcomeMessage } from "@/lib/treetest/actions";
import { Skeleton } from "@/components/ui/skeleton";

const instructions = `# Instructions
**Here's how it works:**

1. You will be presented with an organized list of links (like a menu on a website) and an item to find within (like an article or a piece of information).
2. Click through the list until you arrive at one that you think helps you complete the task.
3. If you take a wrong turn, you can always go back by clicking any of the links above.

![](https://1ws33wab.optimalworkshop.com/images/instructions/treejack_instructions.png)

_This is not a test of your ability, there are no right or wrong answers._  
  
**That's it, let's get started!**`;

const INSTRUCTION_DELAY_MS = 5000;

const TestPreviewPage = ({ params }: { params: { id: string } }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canStart, setCanStart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadWelcomeMessage(params.id)
      .then(setWelcomeMessage)
      .catch((err) => {
        console.error("Failed to load welcome message:", err);
        setError("Failed to load welcome message");
      });
  }, [params.id]);

  useEffect(() => {
    if (showInstructions) {
      setCanStart(false);
      const timer = setTimeout(() => {
        setCanStart(true);
      }, INSTRUCTION_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  const handleNextClick = () => {
    if (showInstructions) {
      router.push(`/treetest/preview/${params.id}/tasks`);
    } else {
      setShowInstructions(true);
    }
  };

  if (error) {
    return (
      <>
        <div className="h-1 bg-theme"></div>
        <div className="container mx-auto max-w-2xl py-8">
          <Card className="p-6">
            <div className="text-center text-red-500">{error}</div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-1 bg-theme"></div>
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="p-6">
          {!showInstructions ? (
            <div className="space-y-6">
              {welcomeMessage === null ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <MarkdownPreview content={welcomeMessage} />
              )}
              <div className="flex justify-end">
                <Button onClick={handleNextClick} disabled={welcomeMessage === null}>
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <MarkdownPreview content={instructions} />
              <div className="flex items-center justify-end gap-4">
                {!canStart && (
                  <p className="text-sm text-muted-foreground">
                    Please read the instructions carefully...
                  </p>
                )}
                <Button onClick={handleNextClick} disabled={!canStart}>
                  Start Test
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default TestPreviewPage;
