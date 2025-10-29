import {
   closestCenter,
   DndContext,
   type DragEndEvent,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
} from "@dnd-kit/core";
import {
   arrayMove,
   SortableContext,
   sortableKeyboardCoordinates,
   useSortable,
   verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@packages/ui/components/button";
import { GripVertical, Plus, Trash2 } from "lucide-react";
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
   onReorderBlocks: (blocks: BlockOption[]) => void;
}

interface SortableBlockItemProps {
   block: BlockOption;
   isSelected: boolean;
   onSelect: (id: string) => void;
   onRemove: (id: string) => void;
}

function SortableBlockItem({
   block,
   isSelected,
   onSelect,
   onRemove,
}: SortableBlockItemProps) {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id: block.id });

   const style = {
      opacity: isDragging ? 0.5 : 1,
      transform: CSS.Transform.toString(transform),
      transition,
   };

   return (
      <div
         className="flex items-center gap-2 group"
         ref={setNodeRef}
         style={style}
      >
         <button
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors"
            type="button"
            {...attributes}
            {...listeners}
         >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
         </button>
         <Button
            className="gap-2 justify-start flex-1"
            onClick={() => onSelect(block.id)}
            size="default"
            variant={isSelected ? "default" : "outline"}
         >
            {block.icon}
            <span className="truncate">{block.name}</span>
         </Button>
         <Button
            className="opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 p-0"
            onClick={(e) => {
               e.stopPropagation();
               onRemove(block.id);
            }}
            size="icon"
            variant="ghost"
         >
            <Trash2 className="h-4 w-4 text-destructive" />
         </Button>
      </div>
   );
}

export function BlockSelector({
   blocks,
   selectedBlock,
   onSelectBlock,
   onAddBlock,
   onRemoveBlock,
   onReorderBlocks,
}: BlockSelectorProps) {
   const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      }),
   );

   const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
         const oldIndex = blocks.findIndex((b) => b.id === active.id);
         const newIndex = blocks.findIndex((b) => b.id === over.id);

         const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex);
         onReorderBlocks(reorderedBlocks);
      }
   };

   return (
      <div className="w-64 bg-card border-r border-border flex flex-col h-screen overflow-hidden">
         <div className="border-b border-border p-4">
            <h2 className="font-semibold text-lg">Blocks</h2>
            <p className="text-xs text-muted-foreground">
               Select a block to edit
            </p>
         </div>
         <div className="flex-1 overflow-y-auto p-4">
            <DndContext
               collisionDetection={closestCenter}
               onDragEnd={handleDragEnd}
               sensors={sensors}
            >
               <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
               >
                  <div className="flex flex-col gap-2">
                     {blocks.map((block) => (
                        <SortableBlockItem
                           block={block}
                           isSelected={selectedBlock === block.id}
                           key={block.id}
                           onRemove={onRemoveBlock}
                           onSelect={onSelectBlock}
                        />
                     ))}
                  </div>
               </SortableContext>
            </DndContext>
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
