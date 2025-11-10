"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown
} from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hint } from "@/components/hint";

interface LayersSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  object: fabric.Object;
}

export const LayersSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: LayersSidebarProps) => {
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const getLayerName = useCallback((type: string | undefined, index: number): string => {
    if (!type) return `Layer ${index + 1}`;
    
    const typeNames: Record<string, string> = {
      rect: "Rectangle",
      circle: "Circle",
      triangle: "Triangle",
      polygon: "Polygon",
      image: "Image",
      textbox: "Text",
      text: "Text",
      "i-text": "Text",
      path: "Path",
      group: "Group",
    };

    return typeNames[type] || `${type} ${index + 1}`;
  }, []);

  const updateLayers = useCallback(() => {
    if (!editor?.canvas) return;
    
    const objects = editor.canvas.getObjects();
    const layerItems: LayerItem[] = objects
      .filter((obj) => obj.name !== "clip") // Exclude workspace
      .map((obj, index) => ({
        id: obj.name || `layer-${index}`,
        name: obj.name || getLayerName(obj.type, index),
        type: obj.type || "object",
        visible: obj.visible !== false,
        locked: obj.selectable === false,
        object: obj,
      }))
      .reverse(); // Reverse to show top layers first

    setLayers(layerItems);

    // Update selected layer
    const activeObjects = editor.canvas.getActiveObjects();
    if (activeObjects.length === 1) {
      const activeObj = activeObjects[0];
      const layerItem = layerItems.find((l) => l.object === activeObj);
      if (layerItem) {
        setSelectedLayerId(layerItem.id);
      }
    } else {
      setSelectedLayerId(null);
    }
  }, [editor?.canvas, getLayerName]);

  useEffect(() => {
    if (!editor?.canvas) return;

    updateLayers();

    const handleObjectModified = () => updateLayers();
    const handleObjectAdded = () => updateLayers();
    const handleObjectRemoved = () => updateLayers();
    const handleSelectionCreated = () => updateLayers();
    const handleSelectionUpdated = () => updateLayers();
    const handleSelectionCleared = () => {
      updateLayers();
      setSelectedLayerId(null);
    };

    editor.canvas.on("object:modified", handleObjectModified);
    editor.canvas.on("object:added", handleObjectAdded);
    editor.canvas.on("object:removed", handleObjectRemoved);
    editor.canvas.on("selection:created", handleSelectionCreated);
    editor.canvas.on("selection:updated", handleSelectionUpdated);
    editor.canvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      editor.canvas.off("object:modified", handleObjectModified);
      editor.canvas.off("object:added", handleObjectAdded);
      editor.canvas.off("object:removed", handleObjectRemoved);
      editor.canvas.off("selection:created", handleSelectionCreated);
      editor.canvas.off("selection:updated", handleSelectionUpdated);
      editor.canvas.off("selection:cleared", handleSelectionCleared);
    };
  }, [editor?.canvas, updateLayers]);

  const toggleVisibility = (layer: LayerItem) => {
    if (!editor?.canvas) return;
    
    layer.object.visible = !layer.object.visible;
    editor.canvas.renderAll();
    updateLayers();
  };

  const toggleLock = (layer: LayerItem) => {
    if (!editor?.canvas) return;
    
    layer.object.selectable = !layer.object.selectable;
    layer.object.evented = !layer.object.evented;
    editor.canvas.renderAll();
    updateLayers();
  };

  const selectLayer = (layer: LayerItem) => {
    if (!editor?.canvas || layer.locked) return;
    
    editor.canvas.setActiveObject(layer.object);
    editor.canvas.renderAll();
    setSelectedLayerId(layer.id);
  };

  const deleteLayer = (layer: LayerItem) => {
    if (!editor?.canvas) return;
    
    editor.canvas.remove(layer.object);
    editor.canvas.renderAll();
    updateLayers();
  };

  const moveLayerUp = (layer: LayerItem) => {
    if (!editor?.canvas) return;
    
    editor.canvas.setActiveObject(layer.object);
    editor.bringForward();
    editor.canvas.discardActiveObject();
    editor.canvas.renderAll();
    updateLayers();
  };

  const moveLayerDown = (layer: LayerItem) => {
    if (!editor?.canvas) return;
    
    editor.canvas.setActiveObject(layer.object);
    editor.sendBackwards();
    editor.canvas.discardActiveObject();
    editor.canvas.renderAll();
    updateLayers();
  };

  const moveLayerToTop = (layer: LayerItem) => {
    if (!editor?.canvas) return;
    
    editor.canvas.setActiveObject(layer.object);
    editor.bringToFront();
    editor.canvas.discardActiveObject();
    editor.canvas.renderAll();
    updateLayers();
  };

  const moveLayerToBottom = (layer: LayerItem) => {
    if (!editor?.canvas) return;
    
    editor.canvas.setActiveObject(layer.object);
    editor.sendToBack();
    editor.canvas.discardActiveObject();
    editor.canvas.renderAll();
    updateLayers();
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "layers" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Layers"
        description="Manage and organize your canvas layers"
      />
      <ScrollArea>
        <div className="p-4 space-y-2">
          {layers.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No layers yet. Add shapes, text, or images to get started.
            </div>
          )}
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              className={cn(
                "group border rounded-lg p-3 space-y-2 hover:bg-gray-50 transition",
                selectedLayerId === layer.id && "bg-blue-50 border-blue-500"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => selectLayer(layer)}
                  className="flex-1 text-left font-medium text-sm truncate"
                  disabled={layer.locked}
                >
                  {layer.name}
                </button>
                <div className="flex items-center gap-1">
                  <Hint label={layer.visible ? "Hide" : "Show"} side="top">
                    <Button
                      onClick={() => toggleVisibility(layer)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                    >
                      {layer.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </Hint>
                  <Hint label={layer.locked ? "Unlock" : "Lock"} side="top">
                    <Button
                      onClick={() => toggleLock(layer)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                    >
                      {layer.locked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Unlock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </Hint>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Hint label="Move to top" side="top">
                  <Button
                    onClick={() => moveLayerToTop(layer)}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={index === 0}
                  >
                    <ChevronsUp className="h-3 w-3" />
                  </Button>
                </Hint>
                <Hint label="Move up" side="top">
                  <Button
                    onClick={() => moveLayerUp(layer)}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                </Hint>
                <Hint label="Move down" side="top">
                  <Button
                    onClick={() => moveLayerDown(layer)}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={index === layers.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </Hint>
                <Hint label="Move to bottom" side="top">
                  <Button
                    onClick={() => moveLayerToBottom(layer)}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={index === layers.length - 1}
                  >
                    <ChevronsDown className="h-3 w-3" />
                  </Button>
                </Hint>
                <div className="flex-1" />
                <Hint label="Delete" side="top">
                  <Button
                    onClick={() => deleteLayer(layer)}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-600 hover:text-red-700"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </Hint>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
