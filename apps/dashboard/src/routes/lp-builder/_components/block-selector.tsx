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
import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from "@packages/ui/components/accordion";
import { Button } from "@packages/ui/components/button";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { BlockCategory } from "../_utils/block-registry";
import { CategorySelector } from "./category-selector";

export interface BlockOption {
   id: string;
   name: string;
   icon?: React.ReactNode;
   blockDefId: string;
}

interface BlockSelectorProps {
   blocks: BlockOption[];
   selectedBlock: string | null;
   onSelectBlock: (blockId: string) => void;
   onAddBlock: (category: BlockCategory) => void;
   onRemoveBlock: (blockId: string) => void;
   onReorderBlocks: (blocks: BlockOption[]) => void;
   selectedTheme: string;
   onThemeChange: (theme: string) => void;
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

const THEME_COLORS: Record<string, string> = {
   bold: "oklch(0.55 0.25 330)",
   clean: "oklch(0.45 0.15 250)",
   default: "oklch(0.5547 0.2503 297.0156)",
   elegant: "oklch(0.35 0.08 40)",
};

export function BlockSelector({
   blocks,
   selectedBlock,
   onSelectBlock,
   onAddBlock,
   onRemoveBlock,
   onReorderBlocks,
   selectedTheme,
   onThemeChange,
}: BlockSelectorProps) {
   const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);

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

   const handleOpenCategorySelector = () => {
      setIsCategorySelectorOpen(true);
   };

   const handleCategorySelected = (category: BlockCategory) => {
      onAddBlock(category);
   };

   return (
      <div className="w-64 bg-card border-r border-border flex flex-col h-screen overflow-hidden">
         <div className="border-b border-border p-4">
            <h2 className="font-semibold text-lg">Blocks</h2>
            <p className="text-xs text-muted-foreground">
               Select a block to edit
            </p>
         </div>
         <div className="border-b border-border p-4">
            <Accordion className="w-full" collapsible type="single">
               <AccordionItem className="border-0" value="themes">
                  <AccordionTrigger className="py-2 px-0 hover:no-underline">
                     <span className="text-sm font-medium">
                        Theme:{" "}
                        <span className="font-semibold capitalize">
                           {selectedTheme || "Select"}
                        </span>
                     </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-0">
                     <div className="grid grid-cols-2 gap-3">
                        {Object.entries(THEME_COLORS).map(
                           ([themeKey, color]) => (
                              <button
                                 className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                    selectedTheme === themeKey
                                       ? "border-primary bg-accent"
                                       : "border-border hover:border-primary/50"
                                 }`}
                                 key={themeKey}
                                 onClick={() => onThemeChange(themeKey)}
                                 type="button"
                              >
                                 <div
                                    className="h-10 w-10 rounded"
                                    style={{ backgroundColor: color }}
                                 />
                                 <span className="text-xs font-medium capitalize">
                                    {themeKey}
                                 </span>
                              </button>
                           ),
                        )}
                     </div>
                  </AccordionContent>
               </AccordionItem>
            </Accordion>
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
            <Button
               className="w-full"
               onClick={handleOpenCategorySelector}
               variant="outline"
            >
               <Plus className="h-4 w-4 mr-2" />
               Add Block
            </Button>
         </div>
         <CategorySelector
            onCategorySelected={handleCategorySelected}
            onOpenChange={setIsCategorySelectorOpen}
            open={isCategorySelectorOpen}
         />
      </div>
   );
}
