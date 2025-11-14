import { 
  ActiveTool, 
  Editor,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface TextEffectsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

// Predefined text shadow effects like in Canva
const TEXT_EFFECTS = [
  { name: "None", shadow: "" },
  { name: "Soft Shadow", shadow: "rgba(0,0,0,0.3) 2px 2px 4px" },
  { name: "Hard Shadow", shadow: "rgba(0,0,0,0.8) 4px 4px 0px" },
  { name: "Drop Shadow", shadow: "rgba(0,0,0,0.5) 3px 3px 6px" },
  { name: "Glow", shadow: "rgba(255,255,255,0.8) 0px 0px 10px" },
  { name: "Strong Glow", shadow: "rgba(255,255,255,1) 0px 0px 20px" },
  { name: "Outline", shadow: "rgba(0,0,0,1) -1px -1px 0px, rgba(0,0,0,1) 1px -1px 0px, rgba(0,0,0,1) -1px 1px 0px, rgba(0,0,0,1) 1px 1px 0px" },
  { name: "Bold Outline", shadow: "rgba(0,0,0,1) -2px -2px 0px, rgba(0,0,0,1) 2px -2px 0px, rgba(0,0,0,1) -2px 2px 0px, rgba(0,0,0,1) 2px 2px 0px" },
  { name: "Neon", shadow: "rgba(255,0,255,0.8) 0px 0px 15px, rgba(0,255,255,0.8) 0px 0px 25px" },
];

export const TextEffectsSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextEffectsSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const currentShadow = editor?.getActiveTextShadow() || "";

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "text-effects" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Text Effects"
        description="Apply shadow effects to your text"
      />
      <ScrollArea>
        <div className="p-4 space-y-2 border-b">
          {TEXT_EFFECTS.map((effect) => (
            <Button
              key={effect.name}
              variant="secondary"
              size="lg"
              className={cn(
                "w-full h-16 justify-start text-left",
                currentShadow === effect.shadow && "border-2 border-blue-500",
              )}
              onClick={() => editor?.changeTextShadow(effect.shadow)}
            >
              <span style={{ textShadow: effect.shadow }}>
                {effect.name}
              </span>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
