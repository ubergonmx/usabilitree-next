import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StudyFormData } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Card } from "@/components/ui/card";

interface MessagesTabProps {
  data: StudyFormData;
  onChange: (data: StudyFormData) => void;
}

export function MessagesTab({ data, onChange }: MessagesTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Welcome Message</Label>
        <Tabs defaultValue="edit" className="w-full">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <Textarea
              id="welcome"
              value={data.messages.welcome}
              onChange={(e) =>
                onChange({
                  ...data,
                  messages: { ...data.messages, welcome: e.target.value },
                })
              }
              placeholder="Enter welcome message (supports markdown)"
              className="min-h-[200px] font-mono"
            />
          </TabsContent>
          <TabsContent value="preview">
            <Card className="p-4">
              <MarkdownPreview content={data.messages.welcome} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-4">
        <Label>Completion Message</Label>
        <Tabs defaultValue="edit" className="w-full">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <Textarea
              id="completion"
              value={data.messages.completion}
              onChange={(e) =>
                onChange({
                  ...data,
                  messages: { ...data.messages, completion: e.target.value },
                })
              }
              placeholder="Enter completion message (supports markdown)"
              className="min-h-[200px] font-mono"
            />
          </TabsContent>
          <TabsContent value="preview">
            <Card className="p-4">
              <MarkdownPreview content={data.messages.completion} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        <p className="font-medium">Supported Markdown:</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li># Heading 1</li>
          <li>## Heading 2</li>
          <li>* or - for bullet points</li>
          <li>_text_ for italics</li>
          <li>**text** for bold text</li>
          <li>[Link Text](url) for links</li>
          <li>![alt text](url) for images</li>
          <li>Enter for new line</li>
        </ul>
      </div>
    </div>
  );
}
