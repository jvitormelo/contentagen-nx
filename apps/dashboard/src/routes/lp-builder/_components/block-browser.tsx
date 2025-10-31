import { Button } from "@packages/ui/components/button";
import {
   Carousel,
   CarouselContent,
   CarouselItem,
   CarouselNext,
   CarouselPrevious,
} from "@packages/ui/components/carousel";
import { Dialog, DialogContent } from "@packages/ui/components/dialog";
import { Tabs, TabsContent } from "@packages/ui/components/tabs";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import {
   ALL_BLOCKS,
   BLOCK_REGISTRY,
   type BlockCategory,
   type BlockDefinition,
} from "../_utils/block-registry";

interface BlockBrowserProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onSelectBlock: (blockId: string) => void;
   selectedCategory: BlockCategory | null;
}

export function BlockBrowser({
   open,
   onOpenChange,
   onSelectBlock,
   selectedCategory,
}: BlockBrowserProps) {
   const filteredBlocks = useMemo(() => {
      if (!selectedCategory) {
         return ALL_BLOCKS;
      }
      return ALL_BLOCKS.filter((block) => block.category === selectedCategory);
   }, [selectedCategory]);

   const handleAddBlock = (blockId: string) => {
      onSelectBlock(blockId);
      onOpenChange(false);
   };

   return (
      <Dialog onOpenChange={onOpenChange} open={open}>
         <DialogContent className="min-w-[70vw] h-[95vh] max-w-none flex flex-col">
            <BlockCarousel blocks={filteredBlocks} onAdd={handleAddBlock} />
         </DialogContent>
      </Dialog>
   );
}

interface BlockCarouselProps {
   blocks: BlockDefinition[];
   onAdd: (blockId: string) => void;
}

function BlockCarousel({ blocks, onAdd }: BlockCarouselProps) {
   if (blocks.length === 0) {
      return (
         <div className="flex-1 flex items-center justify-center text-muted-foreground">
            No blocks available
         </div>
      );
   }

   return (
      <div className="flex-1 w-full h-full">
         <Carousel className="flex  justify-center items-center">
            <CarouselContent>
               {blocks.map((block) => (
                  <CarouselItem
                     className="w-full flex justify-center h-full"
                     key={block.id}
                  >
                     <div className="flex-1 relative">
                        {
                           <block.component
                              content={block.defaultContent}
                           ></block.component>
                        }

                        <Button
                           className="w-full absolute top-4 w-fit right-4"
                           onClick={() => onAdd(block.id)}
                           size="lg"
                        >
                           <Plus className="h-5 w-5 mr-2" />
                           Add This Block
                        </Button>
                     </div>
                  </CarouselItem>
               ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
         </Carousel>
      </div>
   );
}
