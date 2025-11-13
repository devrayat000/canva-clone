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
      // Dynamically import to avoid SSR issues
      const { removeBackground } = await import("@imgly/background-removal");
      
      // Process the image in the browser
      const blob = await removeBackground(imageSrc);
      
      // Convert blob to data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        editor?.addImage(dataUrl);
        setIsProcessing(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Background removal failed:", err);
      setError("Failed to remove background. Please try again.");
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
        description="Remove background from image in browser"
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
            <p className="text-xs text-muted-foreground">
              Processing happens in your browser - no data is sent to servers.
            </p>
          </div>
        </ScrollArea>
      )}
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
