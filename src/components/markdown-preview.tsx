import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const parseMarkdown = (text: string): string => {
    // Escape any HTML that might be in the content
    const escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Parse markdown with allowed tags
    const parsedMarkdown = escapedText
      // Headers
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-3">$1</h2>')
      // Bullet Lists
      .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
        // Ensure URL is properly sanitized
        const sanitizedUrl = url.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]/g, "");
        return `<a href="${sanitizedUrl}" class="text-primary hover:underline" rel="noopener noreferrer">${text}</a>`;
      })
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
        // Ensure URL is properly sanitized
        const sanitizedUrl = url.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]/g, "");
        return `<img src="${sanitizedUrl}" alt="${alt}" class="max-w-full h-auto" />`;
      })
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italics
      .replace(/_(.*?)_/gm, '<em class="italic">$1</em>')
      // Newlines
      .replace(/\n/g, "<br/>")
      // Lists wrapper (bullet)
      .replace(/<li.*?>/g, (match) => `<ul class="list-disc mb-4">${match}`);

    // Sanitize the final HTML with DOMPurify
    return DOMPurify.sanitize(parsedMarkdown, {
      ALLOWED_TAGS: ["h1", "h2", "strong", "em", "ul", "li", "br", "a", "p", "img"],
      ALLOWED_ATTR: ["class", "href", "rel", "src", "alt"],
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  };

  return (
    <div
      className={cn("prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}
