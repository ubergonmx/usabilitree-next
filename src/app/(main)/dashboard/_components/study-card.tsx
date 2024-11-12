"use client";

import { Pencil2Icon, LinkIcon, BarChartIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Studies } from "@/db/schema";
import Link from "next/link";
import * as React from "react";

interface StudyCardProps {
  study: Studies;
  userName?: string;
}

export const StudyCard = ({ study, userName }: StudyCardProps) => {
  const renderActionButton = () => {
    if (study.status === "draft") {
      return (
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/treetest/setup/${study.id}`}>
            <Pencil2Icon className="mr-1 h-4 w-4" />
            <span>Edit</span>
          </Link>
        </Button>
      );
    }

    return (
      <Button variant="secondary" size="sm" asChild>
        <Link href={`/treetest/results/${study.id}`}>
          <BarChartIcon className="mr-1 h-4 w-4" />
          <span>Results</span>
        </Link>
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-base">
          {study.title}
          {study.status === "active" && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => window.open(`/treetest/${study.id}`, "_blank")}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription className="line-clamp-1 text-sm">
          {userName ? <span>{userName} at</span> : null}
          {new Date(Number(study.createdAt) / 1000).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="line-clamp-3 text-sm">{study.description}</CardContent>
      <CardFooter className="flex-row-reverse gap-2">
        {renderActionButton()}
        <Badge
          variant="outline"
          className={`mr-auto rounded-lg capitalize ${
            study.status === "active" ? "bg-green-50 text-green-700" : ""
          }`}
        >
          {study.status}
        </Badge>
      </CardFooter>
    </Card>
  );
};
