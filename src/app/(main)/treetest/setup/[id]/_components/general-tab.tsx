import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StudyFormData } from "@/lib/types/tree-test";
import { CopyStudyDialog } from "./copy-study-dialog";
import { InfoCircledIcon } from "@/components/icons";

interface GeneralTabProps {
  data: StudyFormData;
  studyId: string;
  status: string;
  onChange: (data: StudyFormData) => void;
}

export function GeneralTab({ data, studyId, status, onChange }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Study Title</Label>
        <Input
          id="title"
          value={data.general.title}
          onChange={(e) =>
            onChange({
              ...data,
              general: { ...data.general, title: e.target.value },
            })
          }
          placeholder="Enter study title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.general.description}
          onChange={(e) =>
            onChange({
              ...data,
              general: { ...data.general, description: e.target.value },
            })
          }
          placeholder="Enter study description"
          className="min-h-[100px]"
        />
      </div>

      {status === "draft" && (
        <div className="pt-4">
          <Alert className="mb-4">
            <InfoCircledIcon className="h-4 w-4" />
            <AlertDescription>
              You can copy the entire setup from an existing study, including general settings, tree
              structure, tasks, and messages.
            </AlertDescription>
          </Alert>
          <CopyStudyDialog
            studyId={studyId}
            onCopyStudy={(studyData) => {
              onChange(studyData);
            }}
          />
        </div>
      )}
    </div>
  );
}
