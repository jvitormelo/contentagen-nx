import {
   FeaturesOne,
   defaultContent as featureOneAutocomplete,
} from "@packages/ui/blocks/features-one";
import {
   FooterSection,
   defaultContent as footerOneDefault,
} from "@packages/ui/blocks/footer-one";
import { HeroParallax } from "@packages/ui/blocks/hero-parallax";
import {
   defaultContent,
   HeroSection1,
} from "@packages/ui/blocks/hero-section-one";
import { PricingTable } from "@packages/ui/blocks/pricing-table";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BlockBrowser } from "./_components/block-browser";
import { BlockSelectorSheet } from "./_components/block-selector-sheet";
import {
   BLOCK_REGISTRY,
   type BlockCategory,
   getBlockDefinition,
} from "./_utils/block-registry";

export const Route = createFileRoute("/lp-builder/")({
   component: RouteComponent,
});

interface BlockInstance {
   id: string;
   blockDefId: string;
   name: string;
   content: any;
}

function RouteComponent() {
   const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
   const [selectedTheme, setSelectedTheme] = useState<string>("default");
   const [selectedCategory, setSelectedCategory] =
      useState<BlockCategory | null>(null);

   const [blockBrowserOpen, setBlockBrowserOpen] = useState(false);
   const [blocks, setBlocks] = useState<BlockInstance[]>([
      {
         blockDefId: "hero-parallax",
         content: BLOCK_REGISTRY["hero-parallax"].defaultContent,
         id: "block-1",
         name: "Hero Parallax",
      },
      {
         blockDefId: "hero-section-1",
         content: defaultContent,
         id: "block-2",
         name: "Hero Section 1",
      },
      {
         blockDefId: "features-one",
         content: featureOneAutocomplete,
         id: "block-3",
         name: "Features Section 1",
      },
      {
         blockDefId: "footer-one",
         content: footerOneDefault,
         id: "block-4",
         name: "Footer Section 1",
      },
   ]);

   // Set first block as selected on mount
   if (selectedBlock === null && blocks.length > 0 && blocks[0]?.id) {
      setSelectedBlock(blocks[0].id);
   }

   const handleAddBlock = (blockDefId: string) => {
      const blockDef = getBlockDefinition(blockDefId);
      if (!blockDef) return;

      const newBlock: BlockInstance = {
         blockDefId: blockDefId,
         content: blockDef.defaultContent,
         id: `block-${Date.now()}`,
         name: blockDef.name,
      };

      setBlocks((prev) => [...prev, newBlock]);
      setSelectedBlock(newBlock.id);
   };

   const handleRemoveBlock = (blockId: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      if (selectedBlock === blockId) {
         setSelectedBlock(blocks[0]?.id || null);
      }
   };

   const handleReorderBlocks = (reorderedBlockOptions: BlockOption[]) => {
      // Map the reordered block options back to full block instances
      const reorderedBlocks = reorderedBlockOptions
         .map((option) => blocks.find((b) => b.id === option.id))
         .filter((b): b is BlockInstance => b !== undefined);

      setBlocks(reorderedBlocks);
   };

   return (
      <div>
         <BlockBrowser
            onOpenChange={setBlockBrowserOpen}
            onSelectBlock={handleAddBlock}
            open={blockBrowserOpen}
            selectedCategory={selectedCategory}
         />

         <BlockSelectorSheet
            blocks={blocks.map((b) => ({
               blockDefId: b.blockDefId,
               id: b.id,
               name: b.name,
            }))}
            onAddBlock={(category) => {
               setSelectedCategory(category);
               setBlockBrowserOpen(true);
            }}
            onRemoveBlock={handleRemoveBlock}
            onReorderBlocks={handleReorderBlocks}
            onSelectBlock={setSelectedBlock}
            onThemeChange={setSelectedTheme}
            selectedBlock={selectedBlock}
            selectedTheme={selectedTheme}
         />

         <div>
            {blocks.map((block) => {
               if (block.blockDefId === "hero-parallax") {
                  return (
                     <HeroParallax
                        key={block.id}
                        products={block.content.products}
                     />
                  );
               }
               if (block.blockDefId === "hero-section-1") {
                  return (
                     <HeroSection1 content={block.content} key={block.id} />
                  );
               }
               if (block.blockDefId === "features-one") {
                  return <FeaturesOne content={block.content} key={block.id} />;
               }
               if (block.blockDefId === "footer-one") {
                  return (
                     <FooterSection content={block.content} key={block.id} />
                  );
               }
               if (block.blockDefId === "pricing-table") {
                  return (
                     <PricingTable content={block.content} key={block.id} />
                  );
               }
               return null;
            })}
         </div>
      </div>
   );
}
