// src/components/NewsDetailPopup.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface NewsDetailPopupProps {
  news: {
    title: string | null;
    summary: string | null;
    full_content_url: string;
    source: string | null;
    published_at: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsDetailPopup: React.FC<NewsDetailPopupProps> = ({ news, open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-2xl p-0",
          "bg-white dark:bg-gray-900",
          "border-border dark:border-gray-800"
        )}
        aria-describedby={undefined}
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl">{news.title || "Untitled News"}</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0">
          <p className="text-sm text-muted-foreground mb-2">
            {news.source || "Unknown Source"} • {news.published_at || "No Date"}
          </p>
          <p className="text-sm">{news.summary || "No summary available."}</p>
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button
            variant="outline"
            onClick={() => window.open(news.full_content_url, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink size={16} className="mr-2" />
            Read Full Article
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDetailPopup;
