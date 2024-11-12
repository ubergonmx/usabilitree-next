"use client";

import { Pencil2Icon } from "@/components/icons";
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-base">{study.title}</CardTitle>
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
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/treetest/setup/${study.id}`}>
            <Pencil2Icon className="mr-1 h-4 w-4" />
            <span>Edit</span>
          </Link>
        </Button>
        <Badge variant="outline" className="mr-auto rounded-lg capitalize">
          {study.status} Study
        </Badge>
      </CardFooter>
    </Card>
  );
};
