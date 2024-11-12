"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState, useEffect, KeyboardEvent } from "react";
import { toast } from "sonner";
import {
  addStudyCollaborator,
  getStudyCollaborators,
  removeStudyCollaborator,
  type Collaborator,
} from "@/lib/treetest/results-actions";

interface SharingTabProps {
  studyId: string;
  userEmail: string;
  isOwner: boolean;
}

export function SharingTab({ studyId, userEmail, isOwner }: SharingTabProps) {
  const [emailInput, setEmailInput] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      const data = await getStudyCollaborators(studyId);
      setCollaborators(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to load collaborators");
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (!emailInput) return;

      // Check if trying to add owner's email
      if (emailInput === userEmail) {
        toast.error("You cannot add yourself as a collaborator");
        return;
      }

      if (isValidEmail(emailInput)) {
        if (!collaborators.some((c) => c.email === emailInput)) {
          try {
            await addStudyCollaborator(studyId, emailInput);
            await loadCollaborators();
            setEmailInput("");
            toast.success("Collaborator added successfully");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            toast.error("Failed to add collaborator");
          }
        } else {
          toast.error("This email is already a collaborator");
        }
      } else {
        toast.error("Please enter a valid email address");
      }
    }
  };

  const handleRemove = async (collaborator: Collaborator) => {
    try {
      await removeStudyCollaborator(collaborator.id);
      await loadCollaborators();
      toast.success("Collaborator removed successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to remove collaborator");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Share Results</h2>

      <Card>
        <CardHeader>
          <CardTitle>Collaborators</CardTitle>
          <CardDescription>
            {isOwner
              ? "Add email addresses of people you want to share the results with. They will need to have an account to access the results."
              : "View other collaborators who have access to these results."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOwner && (
            <div className="space-y-2">
              <Input
                placeholder="Enter email addresses and press Enter"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <p className="text-xs text-muted-foreground">Press Enter or comma to add an email</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {collaborators.map((collaborator) => (
              <Badge key={collaborator.id} variant="secondary" className="px-2 py-1">
                {collaborator.email}
                {isOwner && (
                  <button
                    onClick={() => handleRemove(collaborator)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {collaborators.length === 0 && (
              <p className="text-sm text-muted-foreground">No collaborators yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
