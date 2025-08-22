"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Card } from "@/components/ui/card";
import { loadCompletionMessage } from "@/lib/treetest/actions";
import { Skeleton } from "@/components/ui/skeleton";
import * as Sentry from "@sentry/react";

const CompletedPage = ({ params }: { params: { id: string } }) => {
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCompletionMessage(params.id)
      .then(setCompletionMessage)
      .catch((error) => {
        setError("Failed to load completion message");
        Sentry.captureException(error);
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
          <div className="mt-4 flex justify-end">
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default CompletedPage;
