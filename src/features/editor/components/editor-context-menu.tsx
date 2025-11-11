import { 
  Copy, 
  Trash, 
  ChevronsUp, 
  ChevronsDown, 
  ArrowUp, 
  ArrowDown 
} from "lucide-react";
import { Editor } from "@/features/editor/types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface EditorContextMenuProps {
  children: React.ReactNode;
  editor: Editor | undefined;
  disabled?: boolean;
}

export const EditorContextMenu = ({
  children,
  editor,
  disabled = false,
}: EditorContextMenuProps) => {
  const selectedObjects = editor?.selectedObjects || [];
  const hasSelection = selectedObjects.length > 0;

  return (
    <ContextMenu>
      <ContextMenuTrigger disabled={disabled}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {hasSelection && (
          <>
            <ContextMenuItem
              onClick={() => {
                editor?.onCopy();
                editor?.onPaste();
              }}
            >
              <Copy className="size-4 mr-2" />
              Duplicate
              <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => editor?.onCopy()}>
              <Copy className="size-4 mr-2" />
              Copy
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <ArrowUp className="size-4 mr-2" />
                Arrange
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem onClick={() => editor?.bringToFront()}>
                  <ChevronsUp className="size-4 mr-2" />
                  Bring to front
                  <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => editor?.bringForward()}>
                  <ArrowUp className="size-4 mr-2" />
                  Bring forward
                  <ContextMenuShortcut>⌘↑</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => editor?.sendBackwards()}>
                  <ArrowDown className="size-4 mr-2" />
                  Send backward
                  <ContextMenuShortcut>⌘↓</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => editor?.sendToBack()}>
                  <ChevronsDown className="size-4 mr-2" />
                  Send to back
                  <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => editor?.delete()}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="size-4 mr-2" />
              Delete
              <ContextMenuShortcut>⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}
        {!hasSelection && (
          <ContextMenuItem onClick={() => editor?.onPaste()}>
            <Copy className="size-4 mr-2" />
            Paste
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
