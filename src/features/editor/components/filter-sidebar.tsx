import { ActiveTool, Editor, filters } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useMemo, useRef, useState } from "react";
import { fabric } from "fabric";
import { createFilter } from "@/features/editor/utils";

interface FilterSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

interface FilterPreviewProps {
  filter: string;
  imageSrc?: string;
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
}

const FilterPreview = ({
  filter,
  imageSrc,
  isActive,
  disabled,
  onClick,
}: FilterPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fabricCanvas = new fabric.Canvas(canvas, {
      width: 100,
      height: 100,
      selection: false,
    });

    let disposed = false;
    setIsLoading(true);

    const renderPlaceholder = () => {
      fabricCanvas.clear();
      const placeholder = new fabric.Rect({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        fill: new fabric.Gradient({
          type: "linear",
          coords: { x1: 0, y1: 0, x2: 100, y2: 100 },
          colorStops: [
            { offset: 0, color: "#f5f5f5" },
            { offset: 1, color: "#e5e7eb" },
          ],
        }),
      });

      fabricCanvas.add(placeholder);
      fabricCanvas.renderAll();
      setIsLoading(false);
    };

    const renderImage = () => {
      if (!imageSrc) {
        renderPlaceholder();
        return;
      }

      fabric.Image.fromURL(
        imageSrc,
        (img) => {
          if (disposed) {
            return;
          }

          if (filter !== "none") {
            const effect = createFilter(filter);
            if (effect) {
              img.filters = [effect];
              img.applyFilters();
            }
          } else {
            img.filters = [];
          }

          const scale = Math.min(
            100 / (img.width || 1),
            100 / (img.height || 1)
          );
          img.scale(scale);
          img.set({
            left: 50,
            top: 50,
            originX: "center",
            originY: "center",
          });

          fabricCanvas.clear();
          fabricCanvas.add(img);
          fabricCanvas.renderAll();
          setIsLoading(false);
        },
        {
          crossOrigin: "anonymous",
        }
      );
    };

    renderImage();

    return () => {
      disposed = true;
      fabricCanvas.dispose();
    };
  }, [filter, imageSrc]);

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-2 border rounded-md transition-all",
        isActive && "border-blue-500 ring-1 ring-blue-200",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "hover:border-blue-500 hover:bg-blue-50"
      )}
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
  const [selectedFilter, setSelectedFilter] = useState("none");

  const selectedImage = useMemo(() => {
    if (!editor?.selectedObjects?.length) return undefined;

    return editor.selectedObjects.find((object) => object.type === "image") as
      | fabric.Image
      | undefined;
  }, [editor?.selectedObjects]);

  const selectedImageSrc = useMemo(() => {
    if (!selectedImage) return undefined;

    const serialized = selectedImage.toObject(["src"]) as { src?: string };
    return serialized?.src;
  }, [selectedImage]);

  useEffect(() => {
    if (!selectedImage) {
      setSelectedFilter("none");
      return;
    }

    const data = selectedImage.get("data") as
      | { appliedFilter?: string }
      | undefined;
    setSelectedFilter(data?.appliedFilter || "none");
  }, [selectedImage]);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleApplyFilter = (filter: string) => {
    if (!selectedImage) return;

    editor?.changeImageFilter(filter);
    setSelectedFilter(filter);
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-40 w-[360px] h-full flex flex-col",
        activeTool === "filter" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Filters"
        description="Apply a filter to selected image"
      />
      <ScrollArea>
        {!selectedImage && (
          <div className="px-4 py-2 text-sm text-gray-500">
            Select an image on the canvas to preview and apply filters.
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 p-4">
          {filters.map((filter) => (
            <FilterPreview
              key={filter}
              filter={filter}
              imageSrc={selectedImageSrc}
              isActive={selectedFilter === filter}
              disabled={!selectedImage}
              onClick={() => handleApplyFilter(filter)}
            />
          ))}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
