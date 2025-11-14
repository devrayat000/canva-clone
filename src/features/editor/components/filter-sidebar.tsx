import { 
  ActiveTool, 
  Editor,
  filters,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { createFilter } from "@/features/editor/utils";

interface FilterSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

interface FilterPreviewProps {
  filter: string;
  onClick: () => void;
}

const FilterPreview = ({ filter, onClick }: FilterPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a small fabric canvas for the preview
    const fabricCanvas = new fabric.Canvas(canvas, {
      width: 100,
      height: 100,
    });

    // Create a simple gradient as preview image
    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      fill: new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: 100, y2: 100 },
        colorStops: [
          { offset: 0, color: '#ff6b6b' },
          { offset: 0.5, color: '#4ecdc4' },
          { offset: 1, color: '#45b7d1' }
        ]
      })
    });

    fabricCanvas.add(rect);

    // Convert to image and apply filter
    const dataURL = fabricCanvas.toDataURL({ format: 'png' });
    
    fabric.Image.fromURL(dataURL, (img) => {
      fabricCanvas.clear();
      
      if (filter !== "none") {
        const effect = createFilter(filter);
        if (effect) {
          img.filters = [effect];
          img.applyFilters();
        }
      }
      
      img.scaleToWidth(100);
      img.scaleToHeight(100);
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
      setIsLoading(false);
    }, {
      crossOrigin: 'anonymous'
    });

    return () => {
      fabricCanvas.dispose();
    };
  }, [filter]);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-2 border rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all"
    >
      <div className="relative w-[100px] h-[100px] bg-gray-100 rounded overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
            Loading...
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <span className="text-xs font-medium capitalize">{filter}</span>
    </button>
  );
};

export const FilterSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FilterSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "filter" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Filters"
        description="Apply a filter to selected image"
      />
      <ScrollArea>
        <div className="grid grid-cols-2 gap-4 p-4">
          {filters.map((filter) => (
            <FilterPreview
              key={filter}
              filter={filter}
              onClick={() => editor?.changeImageFilter(filter)}
            />
          ))}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
