import NextImage from "next/image";
import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

import {
  removeBackground as imglyRemoveBackground,
  type Config as RemoveBgConfig,
} from "@imgly/background-removal";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RemoveBgSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const RemoveBgSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: RemoveBgSidebarProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const selectedObject = editor?.selectedObjects[0];

  // @ts-ignore
  const imageSrc = selectedObject?._originalElement?.currentSrc;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = async () => {
    if (!imageSrc) return;

    setIsProcessing(true);
    setError(null);
    setProgress(null);

    try {
      const blob = await imglyRemoveBackground(imageSrc, {
        output: {
          format: "image/png",
        },
        progress: (_key, current, total) => {
          if (!total) {
            setProgress(null);
            return;
          }

          const percentage = Math.round((current / total) * 100);
          setProgress(percentage);
        },
        proxyToWorker: true,
      });
      const processedUrl = URL.createObjectURL(blob);

      editor?.addImage(processedUrl);

      // Allow the editor to load the blob URL before revoking it
      setTimeout(() => URL.revokeObjectURL(processedUrl), 1000);
      setIsProcessing(false);
      setProgress(null);
    } catch (err) {
      console.error("Background removal failed:", err);
      setError(
        "Background removal failed. The first run can take longer while the model downloads."
      );
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-40 w-[360px] h-full flex flex-col",
        activeTool === "remove-bg" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Background removal"
        description="Remove solid color backgrounds"
      />
      {!imageSrc && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Feature not available for this object
          </p>
        </div>
      )}
      {imageSrc && (
        <ScrollArea>
          <div className="p-4 space-y-4">
            <div
              className={cn(
                "relative aspect-square rounded-md overflow-hidden transition bg-muted",
                isProcessing && "opacity-50"
              )}
            >
              <NextImage
                src={imageSrc}
                fill
                alt="Image"
                className="object-cover"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {progress !== null && (
              <p className="text-xs text-muted-foreground">
                Downloading assets: {progress}%
              </p>
            )}
            <Button
              disabled={isProcessing}
              onClick={onClick}
              className="w-full"
            >
              {isProcessing ? "Removing background..." : "Remove background"}
            </Button>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                <strong>Browser-based:</strong> Processing happens locally in
                your browser.
              </p>
              <p>
                <strong>Best for:</strong> Images with solid color backgrounds
                that differ from the subject.
              </p>
            </div>
          </div>
        </ScrollArea>
      )}
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
