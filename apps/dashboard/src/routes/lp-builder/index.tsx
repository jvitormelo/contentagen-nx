import {
   FeaturesOne,
   defaultContent as featureOneAutocomplete,
} from "@packages/ui/blocks/features-one";
import {
   FooterSection,
   defaultContent as footerOneDefault,
} from "@packages/ui/blocks/footer-one";
import {
   defaultContent,
   HeroSection1,
} from "@packages/ui/blocks/hero-section-one";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getBlockDefinition } from "./block-registry";
import { BlockBrowser } from "./components/block-browser";
import { BlockSelector } from "./components/block-selector";
import { PropertyPanel } from "./components/property-panel";

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
   const [blockBrowserOpen, setBlockBrowserOpen] = useState(false);
   const [blocks, setBlocks] = useState<BlockInstance[]>([
      {
         blockDefId: "hero-section-1",
         content: defaultContent,
         id: "block-1",
         name: "Hero Section 1",
      },
      {
         blockDefId: "features-one",
         content: featureOneAutocomplete,
         id: "block-2",
         name: "Features Section 1",
      },
      {
         blockDefId: "footer-one",
         content: footerOneDefault,
         id: "block-3",
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

   const handlePropertyChange = (key: string, value: any) => {
      if (!selectedBlock) return;

      setBlocks((prev) =>
         prev.map((block) => {
            if (block.id !== selectedBlock) return block;

            let updatedContent = { ...block.content };

            // Handle nested properties like "testimonial.quote"
            if (key.includes(".")) {
               const [parentKey, childKey] = key.split(".");
               updatedContent = {
                  ...updatedContent,
                  [parentKey]: {
                     ...(updatedContent[parentKey] as object),
                     [childKey]: value,
                  },
               };
            } else {
               // Handle direct property updates (including arrays)
               updatedContent[key] = value;
            }

            return {
               ...block,
               content: updatedContent,
            };
         }),
      );
   };

   const selectedBlockData = blocks.find((b) => b.id === selectedBlock);
   const selectedBlockDef = selectedBlockData
      ? getBlockDefinition(selectedBlockData.blockDefId)
      : null;

   return (
      <div className="flex h-screen bg-background">
         {/* Block Browser Dialog */}
         <BlockBrowser
            onOpenChange={setBlockBrowserOpen}
            onSelectBlock={handleAddBlock}
            open={blockBrowserOpen}
         />

         {/* Left Sidebar - Block Selector */}
         <BlockSelector
            blocks={blocks.map((b) => ({
               blockDefId: b.blockDefId,
               id: b.id,
               name: b.name,
            }))}
            onAddBlock={() => setBlockBrowserOpen(true)}
            onRemoveBlock={handleRemoveBlock}
            onReorderBlocks={handleReorderBlocks}
            onSelectBlock={setSelectedBlock}
            selectedBlock={selectedBlock}
         />

         {/* Main Content Area */}
         <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col min-h-screen pb-20">
               {blocks.map((block) => {
                  if (block.blockDefId === "hero-section-1") {
                     return (
                        <HeroSection1 content={block.content} key={block.id} />
                     );
                  }
                  if (block.blockDefId === "features-one") {
                     return (
                        <FeaturesOne content={block.content} key={block.id} />
                     );
                  }
                  if (block.blockDefId === "footer-one") {
                     return (
                        <FooterSection content={block.content} key={block.id} />
                     );
                  }
                  return null;
               })}
            </div>
         </div>

         {/* Right Sidebar - Property Panel */}
         {selectedBlockData && selectedBlockDef && (
            <PropertyPanel
               blockName={selectedBlockData.name}
               onChange={handlePropertyChange}
               properties={selectedBlockDef.propsConfig}
               values={selectedBlockData.content}
            />
         )}
      </div>
   );
}

function getThemeCSS(): string {
   return `
    /* Import Google Fonts */
    @import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

    /* Reset inherited styles and apply theme fonts to all elements */
    *, *::before, *::after {
      font-family: Montserrat, sans-serif !important;
    }

    :host {
      --background: oklch(0.9578 0.0058 264.5321);
      --foreground: oklch(0.4355 0.043 279.325);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.4355 0.043 279.325);
      --popover: oklch(0.8575 0.0145 268.4756);
      --popover-foreground: oklch(0.4355 0.043 279.325);
      --primary: oklch(0.5547 0.2503 297.0156);
      --primary-foreground: oklch(1 0 0);
      --secondary: oklch(0.8575 0.0145 268.4756);
      --secondary-foreground: oklch(0.4355 0.043 279.325);
      --muted: oklch(0.906 0.0117 264.5071);
      --muted-foreground: oklch(0.5471 0.0343 279.0837);
      --accent: oklch(0.682 0.1448 235.3822);
      --accent-foreground: oklch(1 0 0);
      --destructive: oklch(0.5505 0.2155 19.8095);
      --destructive-foreground: oklch(1 0 0);
      --border: oklch(0.8083 0.0174 271.1982);
      --input: oklch(0.8575 0.0145 268.4756);
      --ring: oklch(0.5547 0.2503 297.0156);
      --chart-1: oklch(0.5547 0.2503 297.0156);
      --chart-2: oklch(0.682 0.1448 235.3822);
      --chart-3: oklch(0.625 0.1772 140.4448);
      --chart-4: oklch(0.692 0.2041 42.4293);
      --chart-5: oklch(0.7141 0.1045 33.0967);
      --sidebar: oklch(0.9335 0.0087 264.5206);
      --sidebar-foreground: oklch(0.4355 0.043 279.325);
      --sidebar-primary: oklch(0.5547 0.2503 297.0156);
      --sidebar-primary-foreground: oklch(1 0 0);
      --sidebar-accent: oklch(0.682 0.1448 235.3822);
      --sidebar-accent-foreground: oklch(1 0 0);
      --sidebar-border: oklch(0.8083 0.0174 271.1982);
      --sidebar-ring: oklch(0.5547 0.2503 297.0156);
      --font-sans: Montserrat, sans-serif;
      --font-serif: Georgia, serif;
      --font-mono: Fira Code, monospace;
      --radius: 0.35rem;
      --shadow-x: 0px;
      --shadow-y: 4px;
      --shadow-blur: 6px;
      --shadow-spread: 0px;
      --shadow-opacity: 0.12;
      --shadow-color: hsl(240 30% 25%);
      --shadow-2xs: 0px 4px 6px 0px hsl(240 30% 25% / 0.06);
      --shadow-xs: 0px 4px 6px 0px hsl(240 30% 25% / 0.06);
      --shadow-sm:
        0px 4px 6px 0px hsl(240 30% 25% / 0.12),
        0px 1px 2px -1px hsl(240 30% 25% / 0.12);
      --shadow:
        0px 4px 6px 0px hsl(240 30% 25% / 0.12),
        0px 1px 2px -1px hsl(240 30% 25% / 0.12);
      --shadow-md:
        0px 4px 6px 0px hsl(240 30% 25% / 0.12),
        0px 2px 4px -1px hsl(240 30% 25% / 0.12);
      --shadow-lg:
        0px 4px 6px 0px hsl(240 30% 25% / 0.12),
        0px 4px 6px -1px hsl(240 30% 25% / 0.12);
      --shadow-xl:
        0px 4px 6px 0px hsl(240 30% 25% / 0.12),
        0px 8px 10px -1px hsl(240 30% 25% / 0.12);
      --shadow-2xl: 0px 4px 6px 0px hsl(240 30% 25% / 0.3);
      --tracking-normal: 0em;
      --spacing: 0.25rem;
    }

    :host(.dark) {
      --background: oklch(0.2155 0.0254 284.0647);
      --foreground: oklch(0.8787 0.0426 272.2767);
      --card: oklch(0.2429 0.0304 283.911);
      --card-foreground: oklch(0.8787 0.0426 272.2767);
      --popover: oklch(0.4037 0.032 280.152);
      --popover-foreground: oklch(0.8787 0.0426 272.2767);
      --primary: oklch(0.7871 0.1187 304.7693);
      --primary-foreground: oklch(0.2429 0.0304 283.911);
      --secondary: oklch(0.4765 0.034 278.643);
      --secondary-foreground: oklch(0.8787 0.0426 272.2767);
      --muted: oklch(0.2973 0.0294 276.2144);
      --muted-foreground: oklch(0.751 0.0396 273.932);
      --accent: oklch(0.8467 0.0833 210.2545);
      --accent-foreground: oklch(0.2429 0.0304 283.911);
      --destructive: oklch(0.7556 0.1297 2.7642);
      --destructive-foreground: oklch(0.2429 0.0304 283.911);
      --border: oklch(0.324 0.0319 281.9784);
      --input: oklch(0.324 0.0319 281.9784);
      --ring: oklch(0.7871 0.1187 304.7693);
      --chart-1: oklch(0.7871 0.1187 304.7693);
      --chart-2: oklch(0.8467 0.0833 210.2545);
      --chart-3: oklch(0.8577 0.1092 142.7153);
      --chart-4: oklch(0.8237 0.1015 52.6294);
      --chart-5: oklch(0.9226 0.0238 30.4919);
      --sidebar: oklch(0.1828 0.0204 284.2039);
      --sidebar-foreground: oklch(0.8787 0.0426 272.2767);
      --sidebar-primary: oklch(0.7871 0.1187 304.7693);
      --sidebar-primary-foreground: oklch(0.2429 0.0304 283.911);
      --sidebar-accent: oklch(0.8467 0.0833 210.2545);
      --sidebar-accent-foreground: oklch(0.2429 0.0304 283.911);
      --sidebar-border: oklch(0.4037 0.032 280.152);
      --sidebar-ring: oklch(0.7871 0.1187 304.7693);
      --font-sans: Montserrat, sans-serif;
      --font-serif: Georgia, serif;
      --font-mono: Fira Code, monospace;
      --radius: 0.35rem;
      --shadow-x: 0px;
      --shadow-y: 4px;
      --shadow-blur: 6px;
      --shadow-spread: 0px;
      --shadow-opacity: 0.12;
      --shadow-color: hsl(240 30% 25%);
      --shadow-2xs: 0px 4px 6px 0px hsl(240 30% 25% / 0.06);
      --shadow-xs: 0px 4px 6px 0px hsl(240 30% 25% / 0.06);
      --shadow-sm:
        0px 4px 6px 0px hsl(240 30% 25% / 0.12),
        0px 1px 2px -1px hsl(240 30% 25% / 0.12);
      --shadow:
        0px 4px 6px 0px hsl(240 30% 25% / 0.12),
        0px 1px 2px -1px hsl(240 30% 25% / 0.12);
      --shadow-md:
        0px 4px 6px 0px hsl(240 30% 25% / 0.12),
        0px 2px 4px -1px hsl(240 30% 25% / 0.12);
      --shadow-lg:
        0px 4px 6px 0px hsl(240 30% 25% / 0.12),
        0px 4px 6px -1px hsl(240 30% 25% / 0.12);
      --shadow-xl:
        0px 4px 6px 0px hsl(240 30% 25% / 0.12),
        0px 8px 10px -1px hsl(240 30% 25% / 0.12);
      --shadow-2xl: 0px 4px 6px 0px hsl(240 30% 25% / 0.3);
    }

    @theme inline {
      --color-background: var(--background);
      --color-foreground: var(--foreground);
      --color-card: var(--card);
      --color-card-foreground: var(--card-foreground);
      --color-popover: var(--popover);
      --color-popover-foreground: var(--popover-foreground);
      --color-primary: var(--primary);
      --color-primary-foreground: var(--primary-foreground);
      --color-secondary: var(--secondary);
      --color-secondary-foreground: var(--secondary-foreground);
      --color-muted: var(--muted);
      --color-muted-foreground: var(--muted-foreground);
      --color-accent: var(--accent);
      --color-accent-foreground: var(--accent-foreground);
      --color-destructive: var(--destructive);
      --color-destructive-foreground: var(--destructive-foreground);
      --color-border: var(--border);
      --color-input: var(--input);
      --color-ring: var(--ring);
      --color-chart-1: var(--chart-1);
      --color-chart-2: var(--chart-2);
      --color-chart-3: var(--chart-3);
      --color-chart-4: var(--chart-4);
      --color-chart-5: var(--chart-5);
      --color-sidebar: var(--sidebar);
      --color-sidebar-foreground: var(--sidebar-foreground);
      --color-sidebar-primary: var(--sidebar-primary);
      --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
      --color-sidebar-accent: var(--sidebar-accent);
      --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
      --color-sidebar-border: var(--sidebar-border);
      --color-sidebar-ring: var(--sidebar-ring);

      --font-sans: var(--font-sans);
      --font-mono: var(--font-mono);
      --font-serif: var(--font-serif);

      --radius-sm: calc(var(--radius) - 4px);
      --radius-md: calc(var(--radius) - 2px);
      --radius-lg: var(--radius);
      --radius-xl: calc(var(--radius) + 4px);

      --shadow-2xs: var(--shadow-2xs);
      --shadow-xs: var(--shadow-xs);
      --shadow-sm: var(--shadow-sm);
      --shadow: var(--shadow);
      --shadow-md: var(--shadow-md);
      --shadow-lg: var(--shadow-lg);
      --shadow-xl: var(--shadow-xl);
      --shadow-2xl: var(--shadow-2xl);
    }
  `;
}
