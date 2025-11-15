import { useEffect, useMemo, useState } from "react";

import {
  ActiveTool,
  Editor,
  CANVAS_SIZE_PRESETS,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ColorPicker } from "@/features/editor/components/color-picker";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Prebuilt backgrounds suitable for election posters
const PRESET_BACKGROUNDS = [
  { name: "White", color: "#ffffff" },
  { name: "Light Blue", color: "#e3f2fd" },
  { name: "Light Red", color: "#ffebee" },
  { name: "Light Green", color: "#e8f5e9" },
  { name: "Light Yellow", color: "#fffde7" },
  { name: "Light Orange", color: "#fff3e0" },
  { name: "Navy Blue", color: "#1a237e" },
  { name: "Dark Red", color: "#b71c1c" },
  { name: "Dark Green", color: "#1b5e20" },
  { name: "Royal Blue", color: "#0d47a1" },
  { name: "Maroon", color: "#880e4f" },
  { name: "Dark Gray", color: "#263238" },
];

interface SettingsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const SettingsSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: SettingsSidebarProps) => {
  const workspace = editor?.getWorkspace();

  const initialWidth = useMemo(() => `${workspace?.width ?? 0}`, [workspace]);
  const initialHeight = useMemo(() => `${workspace?.height ?? 0}`, [workspace]);
  const initialBackground = useMemo(
    () => workspace?.fill ?? "#ffffff",
    [workspace]
  );

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [background, setBackground] = useState(initialBackground);

  useEffect(() => {
    setWidth(initialWidth);
    setHeight(initialHeight);
    setBackground(initialBackground);
  }, [initialWidth, initialHeight, initialBackground]);

  const changeWidth = (value: string) => setWidth(value);
  const changeHeight = (value: string) => setHeight(value);
  const changeBackground = (value: string) => {
    setBackground(value);
    editor?.changeBackground(value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    editor?.changeSize({
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    });
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-40 w-[360px] h-full flex flex-col",
        activeTool === "settings" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Canvas Settings"
        description="Customize your canvas size and background"
      />
      <ScrollArea>
        <div className="p-4 flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <Label>Canvas Size Presets (Election Posters)</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setWidth(String(CANVAS_SIZE_PRESETS.SQUARE.width));
                  setHeight(String(CANVAS_SIZE_PRESETS.SQUARE.height));
                  editor?.changeSize({
                    width: CANVAS_SIZE_PRESETS.SQUARE.width,
                    height: CANVAS_SIZE_PRESETS.SQUARE.height,
                  });
                }}
              >
                📱 {CANVAS_SIZE_PRESETS.SQUARE.name}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setWidth(String(CANVAS_SIZE_PRESETS.PORTRAIT.width));
                  setHeight(String(CANVAS_SIZE_PRESETS.PORTRAIT.height));
                  editor?.changeSize({
                    width: CANVAS_SIZE_PRESETS.PORTRAIT.width,
                    height: CANVAS_SIZE_PRESETS.PORTRAIT.height,
                  });
                }}
              >
                📄 {CANVAS_SIZE_PRESETS.PORTRAIT.name}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setWidth(String(CANVAS_SIZE_PRESETS.LANDSCAPE.width));
                  setHeight(String(CANVAS_SIZE_PRESETS.LANDSCAPE.height));
                  editor?.changeSize({
                    width: CANVAS_SIZE_PRESETS.LANDSCAPE.width,
                    height: CANVAS_SIZE_PRESETS.LANDSCAPE.height,
                  });
                }}
              >
                🖼️ {CANVAS_SIZE_PRESETS.LANDSCAPE.name}
              </Button>
            </div>
          </div>
        </div>
        <form
          className="flex flex-col gap-y-4 p-4 border-t"
          onSubmit={onSubmit}
        >
          <div className="flex flex-col gap-y-2">
            <Label>Height</Label>
            <Input
              placeholder="Height"
              value={height}
              type="number"
              onChange={(e) => changeHeight(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Width</Label>
            <Input
              placeholder="Width"
              value={width}
              type="number"
              onChange={(e) => changeWidth(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Resize
          </Button>
        </form>
        <div className="p-4">
          <div className="flex flex-col gap-y-2 mb-4">
            <Label>Preset Backgrounds</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_BACKGROUNDS.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  className={cn(
                    "h-16 rounded-md border-2 transition-all hover:scale-105",
                    background === preset.color
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-300"
                  )}
                  style={{ backgroundColor: preset.color }}
                  onClick={() => changeBackground(preset.color)}
                  title={preset.name}
                >
                  <span className="sr-only">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Custom Color</Label>
            <ColorPicker
              value={background as string} // We dont support gradients or patterns
              onChange={changeBackground}
            />
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
