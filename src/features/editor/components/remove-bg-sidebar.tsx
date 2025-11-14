import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

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
};

export const RemoveBgSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: RemoveBgSidebarProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    
    try {
      // Use canvas-based approach for background removal
      // This is a simple implementation - for production, consider using
      // a dedicated library or API service
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple background removal: remove pixels similar to corners
      // This is a basic implementation - real bg removal needs ML models
      const threshold = 30;
      const corners = [
        { x: 0, y: 0 },
        { x: canvas.width - 1, y: 0 },
        { x: 0, y: canvas.height - 1 },
        { x: canvas.width - 1, y: canvas.height - 1 },
      ];
      
      const bgColors = corners.map(({ x, y }) => {
        const i = (y * canvas.width + x) * 4;
        return { r: data[i], g: data[i + 1], b: data[i + 2] };
      });
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        for (const bgColor of bgColors) {
          const diff = Math.abs(r - bgColor.r) + Math.abs(g - bgColor.g) + Math.abs(b - bgColor.b);
          if (diff < threshold) {
            data[i + 3] = 0; // Make transparent
            break;
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      editor?.addImage(dataUrl);
      setIsProcessing(false);
    } catch (err) {
      console.error("Background removal failed:", err);
      setError("Failed to remove background. For best results, ensure the background is a solid color different from the subject.");
      setIsProcessing(false);
    }
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "remove-bg" ? "visible" : "hidden",
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
            <div className={cn(
              "relative aspect-square rounded-md overflow-hidden transition bg-muted",
              isProcessing && "opacity-50",
            )}>
              <Image
                src={imageSrc}
                fill
                alt="Image"
                className="object-cover"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
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
                <strong>Browser-based:</strong> Processing happens locally in your browser.
              </p>
              <p>
                <strong>Best for:</strong> Images with solid color backgrounds that differ from the subject.
              </p>
            </div>
          </div>
        </ScrollArea>
      )}
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
