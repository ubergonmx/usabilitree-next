"use client";

import React, { useState, useEffect } from "react";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Card } from "@/components/ui/card";
import { loadCompletionMessage, updateParticipantCompletion } from "@/lib/treetest/actions";
import { Skeleton } from "@/components/ui/skeleton";

const CompletedPage = ({ params }: { params: { id: string } }) => {
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const participantId = localStorage.getItem("participantId");

    // Update completion time if participantId exists
    if (participantId) {
      updateParticipantCompletion(participantId).catch((err) => {
        console.error("Failed to update completion time:", err);
      });
    }

    // Remove participantId from localStorage
    localStorage.removeItem("participantId");

    // Load completion message
    loadCompletionMessage(params.id)
      .then(setCompletionMessage)
      .catch((err) => {
        console.error("Failed to load completion message:", err);
        setError("Failed to load completion message");
      });
  }, [params.id]);

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
          {completionMessage === null ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <MarkdownPreview content={completionMessage} />
          )}
        </Card>
      </div>
    </>
  );
};

export default CompletedPage;
