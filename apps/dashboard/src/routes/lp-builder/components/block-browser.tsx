import { Button } from "@packages/ui/components/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@packages/ui/components/dialog";
import {
   Tabs,
   TabsContent,
   TabsList,
   TabsTrigger,
} from "@packages/ui/components/tabs";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
   BLOCK_CATEGORIES,
   type BlockCategory,
   type BlockDefinition,
   getBlocksByCategory,
} from "../block-registry";

interface BlockBrowserProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onSelectBlock: (blockId: string) => void;
}

export function BlockBrowser({
   open,
   onOpenChange,
   onSelectBlock,
}: BlockBrowserProps) {
   const [selectedCategory, setSelectedCategory] =
      useState<BlockCategory>("hero");

   const handleAddBlock = (blockId: string) => {
      onSelectBlock(blockId);
      onOpenChange(false);
   };

   return (
      <Dialog onOpenChange={onOpenChange} open={open}>
         <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
               <DialogTitle>Add Block</DialogTitle>
               <DialogDescription>
                  Choose a block to add to your landing page
               </DialogDescription>
            </DialogHeader>

            <Tabs
               className="flex-1 overflow-hidden flex flex-col"
               defaultValue="hero"
               onValueChange={(value) =>
                  setSelectedCategory(value as BlockCategory)
               }
               value={selectedCategory}
            >
               <TabsList className="grid w-full grid-cols-5">
                  {(Object.keys(BLOCK_CATEGORIES) as BlockCategory[]).map(
                     (category) => (
                        <TabsTrigger key={category} value={category}>
                           {BLOCK_CATEGORIES[category].name}
                        </TabsTrigger>
                     ),
                  )}
               </TabsList>

               {(Object.keys(BLOCK_CATEGORIES) as BlockCategory[]).map(
                  (category) => (
                     <TabsContent
                        className="flex-1 overflow-y-auto mt-4"
                        key={category}
                        value={category}
                     >
                        <div className="mb-3">
                           <p className="text-sm text-muted-foreground">
                              {BLOCK_CATEGORIES[category].description}
                           </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           {getBlocksByCategory(category).map((block) => (
                              <BlockCard
                                 block={block}
                                 key={block.id}
                                 onAdd={handleAddBlock}
                              />
                           ))}
                        </div>
                     </TabsContent>
                  ),
               )}
            </Tabs>
         </DialogContent>
      </Dialog>
   );
}

interface BlockCardProps {
   block: BlockDefinition;
   onAdd: (blockId: string) => void;
}

function BlockCard({ block, onAdd }: BlockCardProps) {
   return (
      <div className="border border-border rounded-lg overflow-hidden hover:border-primary transition-colors">
         {/* Preview Thumbnail */}
         <div className="aspect-video bg-muted/30 relative overflow-hidden">
            {block.thumbnail ? (
               <img
                  alt={block.name}
                  className="w-full h-full object-cover"
                  src={block.thumbnail}
               />
            ) : (
               <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-4">
                     <div className="text-xs text-muted-foreground mb-2">
                        Preview
                     </div>
                     <div className="text-2xl font-bold text-muted-foreground/30">
                        {block.name}
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Block Info */}
         <div className="p-4">
            <h3 className="font-semibold text-sm mb-1">{block.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">
               {block.description}
            </p>
            <Button
               className="w-full"
               onClick={() => onAdd(block.id)}
               size="sm"
               variant="outline"
            >
               <Plus className="h-4 w-4 mr-2" />
               Add Block
            </Button>
         </div>
      </div>
   );
}
