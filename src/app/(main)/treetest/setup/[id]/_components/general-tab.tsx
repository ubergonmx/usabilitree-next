import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudyFormData } from "./types";

interface GeneralTabProps {
  data: StudyFormData;
  onChange: (data: StudyFormData) => void;
}

export function GeneralTab({ data, onChange }: GeneralTabProps) {
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
    </div>
  );
} 