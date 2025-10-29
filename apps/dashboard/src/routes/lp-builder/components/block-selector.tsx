import { Button } from "@packages/ui/components/button";
import { Plus, Trash2 } from "lucide-react";
import type React from "react";

export interface BlockOption {
   id: string;
   name: string;
   icon?: React.ReactNode;
   blockDefId: string; // Reference to block registry
}

interface BlockSelectorProps {
   blocks: BlockOption[];
   selectedBlock: string | null;
   onSelectBlock: (blockId: string) => void;
   onAddBlock: () => void;
   onRemoveBlock: (blockId: string) => void;
}

export function BlockSelector({
   blocks,
   selectedBlock,
   onSelectBlock,
   onAddBlock,
   onRemoveBlock,
}: BlockSelectorProps) {
   return (
      <div className="w-64 bg-card border-r border-border flex flex-col h-screen overflow-hidden">
         <div className="border-b border-border p-4">
            <h2 className="font-semibold text-lg">Blocks</h2>
            <p className="text-xs text-muted-foreground">
               Select a block to edit
            </p>
         </div>
         <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-2">
               {blocks.map((block) => (
                  <div className="flex items-center gap-2 group" key={block.id}>
                     <Button
                        className="gap-2 justify-start flex-1"
                        onClick={() => onSelectBlock(block.id)}
                        size="default"
                        variant={
                           selectedBlock === block.id ? "default" : "outline"
                        }
                     >
                        {block.icon}
                        <span className="truncate">{block.name}</span>
                     </Button>
                     <Button
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 p-0"
                        onClick={(e) => {
                           e.stopPropagation();
                           onRemoveBlock(block.id);
                        }}
                        size="icon"
                        variant="ghost"
                     >
                        <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                  </div>
               ))}
            </div>
         </div>
         <div className="border-t border-border p-4">
            <Button className="w-full" onClick={onAddBlock} variant="outline">
               <Plus className="h-4 w-4 mr-2" />
               Add Block
            </Button>
         </div>
      </div>
   );
}
