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
import { PricingTable } from "@packages/ui/blocks/pricing-table";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BlockBrowser } from "./_components/block-browser";
import { type BlockOption, BlockSelector } from "./_components/block-selector";
import { PropertyPanel } from "./_components/property-panel";
import { getBlockDefinition } from "./_utils/block-registry";

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

   // Inject theme CSS based on selected theme
   useEffect(() => {
      const styleId = "lp-builder-theme";
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
         styleElement = document.createElement("style");
         styleElement.id = styleId;
         document.head.appendChild(styleElement);
      }

      styleElement.textContent =
         selectedTheme === "clean"
            ? getCleanTheme()
            : selectedTheme === "elegant"
              ? getElegantTheme()
              : selectedTheme === "bold"
                ? getBoldTheme()
                : getThemeCSS();

      return () => {
         const element = document.getElementById(styleId);
         if (element) {
            element.remove();
         }
      };
   }, [selectedTheme]);

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
                  [parentKey as string]: {
                     ...(updatedContent[parentKey as string] as object),
                     [childKey as string]: value,
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
            onThemeChange={setSelectedTheme}
            selectedBlock={selectedBlock}
            selectedTheme={selectedTheme}
         />

         {/* Main Content Area */}
         <div className="flex-1 overflow-y-auto">
            <div
               className="flex flex-col min-h-screen pb-20"
               id="lp-preview-area"
            >
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
                  if (block.blockDefId === "pricing-table") {
                     return (
                        <PricingTable content={block.content} key={block.id} />
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
    @import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

    #lp-preview-area *, #lp-preview-area *::before, #lp-preview-area *::after {
      font-family: Montserrat, sans-serif !important;
    }

    #lp-preview-area {
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

    #lp-preview-area.dark {
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

function getElegantTheme() {
   return `
  @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&family=Lato:wght@300;400;700&display=swap");

  #lp-preview-area *, #lp-preview-area *::before, #lp-preview-area *::after {
    font-family: "Lato", sans-serif !important;
  }

  #lp-preview-area h1, #lp-preview-area h2, #lp-preview-area h3, #lp-preview-area h4, #lp-preview-area h5, #lp-preview-area h6 {
    font-family: "Playfair Display", serif !important;
  }

  #lp-preview-area {
    --background: oklch(0.98 0.005 80);
    --foreground: oklch(0.20 0.01 80);
    --card: oklch(1.0 0 0);
    --card-foreground: oklch(0.20 0.01 80);
    --popover: oklch(1.0 0 0);
    --popover-foreground: oklch(0.20 0.01 80);
    --primary: oklch(0.35 0.08 40);
    --primary-foreground: oklch(0.98 0.005 80);
    --secondary: oklch(0.55 0.12 85);
    --secondary-foreground: oklch(0.98 0.005 80);
    --muted: oklch(0.95 0.005 80);
    --muted-foreground: oklch(0.48 0.01 80);
    --accent: oklch(0.50 0.10 60);
    --accent-foreground: oklch(0.98 0.005 80);
    --destructive: oklch(0.50 0.18 30);
    --destructive-foreground: oklch(1.0 0 0);
    --border: oklch(0.88 0.005 80);
    --input: oklch(0.88 0.005 80);
    --ring: oklch(0.35 0.08 40);
    --chart-1: oklch(0.35 0.08 40);
    --chart-2: oklch(0.55 0.12 85);
    --chart-3: oklch(0.50 0.10 60);
    --chart-4: oklch(0.50 0.18 30);
    --chart-5: oklch(0.45 0.09 50);
    --sidebar: oklch(1.0 0 0);
    --sidebar-foreground: oklch(0.20 0.01 80);
    --sidebar-primary: oklch(0.35 0.08 40);
    --sidebar-primary-foreground: oklch(0.98 0.005 80);
    --sidebar-accent: oklch(0.50 0.10 60);
    --sidebar-accent-foreground: oklch(0.98 0.005 80);
    --sidebar-border: oklch(0.88 0.005 80);
    --sidebar-ring: oklch(0.35 0.08 40);
    --font-sans: "Lato", sans-serif;
    --font-serif: "Playfair Display", serif;
    --font-mono: ui-monospace, monospace;
    --radius: 0.25rem;
    --shadow-x: 0px;
    --shadow-y: 2px;
    --shadow-blur: 8px;
    --shadow-spread: 0px;
    --shadow-opacity: 0.08;
    --shadow-color: hsl(40 20% 20%);
    --shadow-2xs: 0px 1px 2px 0px hsl(40 20% 20% / 0.04);
    --shadow-xs: 0px 2px 4px 0px hsl(40 20% 20% / 0.06);
    --shadow-sm: 0px 2px 8px 0px hsl(40 20% 20% / 0.08), 0px 1px 2px -1px hsl(40 20% 20% / 0.08);
    --shadow: 0px 2px 8px 0px hsl(40 20% 20% / 0.08), 0px 1px 2px -1px hsl(40 20% 20% / 0.08);
    --shadow-md: 0px 4px 12px 0px hsl(40 20% 20% / 0.08), 0px 2px 4px -1px hsl(40 20% 20% / 0.08);
    --shadow-lg: 0px 8px 16px 0px hsl(40 20% 20% / 0.08), 0px 4px 6px -1px hsl(40 20% 20% / 0.08);
    --shadow-xl: 0px 12px 24px 0px hsl(40 20% 20% / 0.08), 0px 8px 10px -1px hsl(40 20% 20% / 0.08);
    --shadow-2xl: 0px 20px 40px 0px hsl(40 20% 20% / 0.12);
    --tracking-normal: 0em;
    --spacing: 0.25rem;
  }

  #lp-preview-area.dark {
    --background: oklch(0.18 0.01 80);
    --foreground: oklch(0.92 0.005 80);
    --card: oklch(0.22 0.01 80);
    --card-foreground: oklch(0.92 0.005 80);
    --popover: oklch(0.22 0.01 80);
    --popover-foreground: oklch(0.92 0.005 80);
    --primary: oklch(0.65 0.10 40);
    --primary-foreground: oklch(0.18 0.01 80);
    --secondary: oklch(0.70 0.14 85);
    --secondary-foreground: oklch(0.18 0.01 80);
    --muted: oklch(0.25 0.01 80);
    --muted-foreground: oklch(0.68 0.005 80);
    --accent: oklch(0.68 0.12 60);
    --accent-foreground: oklch(0.18 0.01 80);
    --destructive: oklch(0.65 0.20 30);
    --destructive-foreground: oklch(1.0 0 0);
    --border: oklch(0.32 0.01 80);
    --input: oklch(0.32 0.01 80);
    --ring: oklch(0.65 0.10 40);
    --chart-1: oklch(0.65 0.10 40);
    --chart-2: oklch(0.70 0.14 85);
    --chart-3: oklch(0.68 0.12 60);
    --chart-4: oklch(0.65 0.20 30);
    --chart-5: oklch(0.62 0.11 50);
    --sidebar: oklch(0.16 0.01 80);
    --sidebar-foreground: oklch(0.92 0.005 80);
    --sidebar-primary: oklch(0.65 0.10 40);
    --sidebar-primary-foreground: oklch(0.18 0.01 80);
    --sidebar-accent: oklch(0.68 0.12 60);
    --sidebar-accent-foreground: oklch(0.18 0.01 80);
    --sidebar-border: oklch(0.32 0.01 80);
    --sidebar-ring: oklch(0.65 0.10 40);
    --font-sans: "Lato", sans-serif;
    --font-serif: "Playfair Display", serif;
    --font-mono: ui-monospace, monospace;
    --radius: 0.25rem;
    --shadow-x: 0px;
    --shadow-y: 2px;
    --shadow-blur: 8px;
    --shadow-spread: 0px;
    --shadow-opacity: 0.15;
    --shadow-color: hsl(40 20% 10%);
    --shadow-2xs: 0px 1px 2px 0px hsl(40 20% 10% / 0.08);
    --shadow-xs: 0px 2px 4px 0px hsl(40 20% 10% / 0.12);
    --shadow-sm: 0px 2px 8px 0px hsl(40 20% 10% / 0.15), 0px 1px 2px -1px hsl(40 20% 10% / 0.15);
    --shadow: 0px 2px 8px 0px hsl(40 20% 10% / 0.15), 0px 1px 2px -1px hsl(40 20% 10% / 0.15);
    --shadow-md: 0px 4px 12px 0px hsl(40 20% 10% / 0.15), 0px 2px 4px -1px hsl(40 20% 10% / 0.15);
    --shadow-lg: 0px 8px 16px 0px hsl(40 20% 10% / 0.15), 0px 4px 6px -1px hsl(40 20% 10% / 0.15);
    --shadow-xl: 0px 12px 24px 0px hsl(40 20% 10% / 0.15), 0px 8px 10px -1px hsl(40 20% 10% / 0.15);
    --shadow-2xl: 0px 20px 40px 0px hsl(40 20% 10% / 0.20);
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
  }`;
}

function getBoldTheme() {
   return `
  @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap");

  #lp-preview-area *, #lp-preview-area *::before, #lp-preview-area *::after {
    font-family: "Space Grotesk", sans-serif !important;
  }

  #lp-preview-area {
    --background: oklch(0.97 0.01 280);
    --foreground: oklch(0.18 0.02 280);
    --card: oklch(1.0 0 0);
    --card-foreground: oklch(0.18 0.02 280);
    --popover: oklch(1.0 0 0);
    --popover-foreground: oklch(0.18 0.02 280);
    --primary: oklch(0.55 0.25 330);
    --primary-foreground: oklch(1.0 0 0);
    --secondary: oklch(0.58 0.20 180);
    --secondary-foreground: oklch(1.0 0 0);
    --muted: oklch(0.94 0.01 280);
    --muted-foreground: oklch(0.48 0.02 280);
    --accent: oklch(0.60 0.22 270);
    --accent-foreground: oklch(1.0 0 0);
    --destructive: oklch(0.58 0.24 20);
    --destructive-foreground: oklch(1.0 0 0);
    --border: oklch(0.85 0.01 280);
    --input: oklch(0.85 0.01 280);
    --ring: oklch(0.55 0.25 330);
    --chart-1: oklch(0.55 0.25 330);
    --chart-2: oklch(0.58 0.20 180);
    --chart-3: oklch(0.60 0.22 270);
    --chart-4: oklch(0.58 0.24 20);
    --chart-5: oklch(0.56 0.23 300);
    --sidebar: oklch(1.0 0 0);
    --sidebar-foreground: oklch(0.18 0.02 280);
    --sidebar-primary: oklch(0.55 0.25 330);
    --sidebar-primary-foreground: oklch(1.0 0 0);
    --sidebar-accent: oklch(0.60 0.22 270);
    --sidebar-accent-foreground: oklch(1.0 0 0);
    --sidebar-border: oklch(0.85 0.01 280);
    --sidebar-ring: oklch(0.55 0.25 330);
    --font-sans: "Space Grotesk", sans-serif;
    --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    --font-mono: ui-monospace, monospace;
    --radius: 0.75rem;
    --shadow-x: 0px;
    --shadow-y: 4px;
    --shadow-blur: 12px;
    --shadow-spread: 0px;
    --shadow-opacity: 0.15;
    --shadow-color: hsl(330 80% 40%);
    --shadow-2xs: 0px 2px 4px 0px hsl(330 80% 40% / 0.08);
    --shadow-xs: 0px 4px 8px 0px hsl(330 80% 40% / 0.10);
    --shadow-sm: 0px 4px 12px 0px hsl(330 80% 40% / 0.15), 0px 2px 4px -1px hsl(330 80% 40% / 0.15);
    --shadow: 0px 4px 12px 0px hsl(330 80% 40% / 0.15), 0px 2px 4px -1px hsl(330 80% 40% / 0.15);
    --shadow-md: 0px 6px 16px 0px hsl(330 80% 40% / 0.15), 0px 4px 8px -1px hsl(330 80% 40% / 0.15);
    --shadow-lg: 0px 10px 24px 0px hsl(330 80% 40% / 0.15), 0px 6px 12px -1px hsl(330 80% 40% / 0.15);
    --shadow-xl: 0px 16px 32px 0px hsl(330 80% 40% / 0.15), 0px 10px 16px -1px hsl(330 80% 40% / 0.15);
    --shadow-2xl: 0px 24px 48px 0px hsl(330 80% 40% / 0.20);
    --tracking-normal: -0.02em;
    --spacing: 0.25rem;
  }

  #lp-preview-area.dark {
    --background: oklch(0.15 0.02 280);
    --foreground: oklch(0.95 0.01 280);
    --card: oklch(0.20 0.02 280);
    --card-foreground: oklch(0.95 0.01 280);
    --popover: oklch(0.20 0.02 280);
    --popover-foreground: oklch(0.95 0.01 280);
    --primary: oklch(0.68 0.28 330);
    --primary-foreground: oklch(0.98 0 0);
    --secondary: oklch(0.70 0.22 180);
    --secondary-foreground: oklch(0.15 0.02 280);
    --muted: oklch(0.25 0.02 280);
    --muted-foreground: oklch(0.70 0.01 280);
    --accent: oklch(0.72 0.24 270);
    --accent-foreground: oklch(0.15 0.02 280);
    --destructive: oklch(0.70 0.26 20);
    --destructive-foreground: oklch(1.0 0 0);
    --border: oklch(0.30 0.02 280);
    --input: oklch(0.30 0.02 280);
    --ring: oklch(0.68 0.28 330);
    --chart-1: oklch(0.68 0.28 330);
    --chart-2: oklch(0.70 0.22 180);
    --chart-3: oklch(0.72 0.24 270);
    --chart-4: oklch(0.70 0.26 20);
    --chart-5: oklch(0.69 0.25 300);
    --sidebar: oklch(0.13 0.02 280);
    --sidebar-foreground: oklch(0.95 0.01 280);
    --sidebar-primary: oklch(0.68 0.28 330);
    --sidebar-primary-foreground: oklch(0.98 0 0);
    --sidebar-accent: oklch(0.72 0.24 270);
    --sidebar-accent-foreground: oklch(0.15 0.02 280);
    --sidebar-border: oklch(0.30 0.02 280);
    --sidebar-ring: oklch(0.68 0.28 330);
    --font-sans: "Space Grotesk", sans-serif;
    --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    --font-mono: ui-monospace, monospace;
    --radius: 0.75rem;
    --shadow-x: 0px;
    --shadow-y: 4px;
    --shadow-blur: 12px;
    --shadow-spread: 0px;
    --shadow-opacity: 0.25;
    --shadow-color: hsl(330 80% 30%);
    --shadow-2xs: 0px 2px 4px 0px hsl(330 80% 30% / 0.15);
    --shadow-xs: 0px 4px 8px 0px hsl(330 80% 30% / 0.20);
    --shadow-sm: 0px 4px 12px 0px hsl(330 80% 30% / 0.25), 0px 2px 4px -1px hsl(330 80% 30% / 0.25);
    --shadow: 0px 4px 12px 0px hsl(330 80% 30% / 0.25), 0px 2px 4px -1px hsl(330 80% 30% / 0.25);
    --shadow-md: 0px 6px 16px 0px hsl(330 80% 30% / 0.25), 0px 4px 8px -1px hsl(330 80% 30% / 0.25);
    --shadow-lg: 0px 10px 24px 0px hsl(330 80% 30% / 0.25), 0px 6px 12px -1px hsl(330 80% 30% / 0.25);
    --shadow-xl: 0px 16px 32px 0px hsl(330 80% 30% / 0.25), 0px 10px 16px -1px hsl(330 80% 30% / 0.25);
    --shadow-2xl: 0px 24px 48px 0px hsl(330 80% 30% / 0.30);
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
  }`;
}

function getCleanTheme() {
   return `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300..700&display=swap");

  #lp-preview-area *, #lp-preview-area *::before, #lp-preview-area *::after {
    font-family: "Inter", sans-serif !important;
  }

  #lp-preview-area {
    --background: oklch(0.99 0 0);
    --foreground: oklch(0.15 0 0);
    --card: oklch(1.0 0 0);
    --card-foreground: oklch(0.15 0 0);
    --popover: oklch(1.0 0 0);
    --popover-foreground: oklch(0.15 0 0);
    --primary: oklch(0.45 0.15 250);
    --primary-foreground: oklch(1.0 0 0);
    --secondary: oklch(0.50 0.08 200);
    --secondary-foreground: oklch(1.0 0 0);
    --muted: oklch(0.96 0 0);
    --muted-foreground: oklch(0.45 0 0);
    --accent: oklch(0.48 0.12 230);
    --accent-foreground: oklch(1.0 0 0);
    --destructive: oklch(0.55 0.22 25);
    --destructive-foreground: oklch(1.0 0 0);
    --border: oklch(0.90 0 0);
    --input: oklch(0.90 0 0);
    --ring: oklch(0.45 0.15 250);
    --chart-1: oklch(0.45 0.15 250);
    --chart-2: oklch(0.50 0.08 200);
    --chart-3: oklch(0.48 0.12 230);
    --chart-4: oklch(0.55 0.22 25);
    --chart-5: oklch(0.52 0.10 180);
    --sidebar: oklch(1.0 0 0);
    --sidebar-foreground: oklch(0.15 0 0);
    --sidebar-primary: oklch(0.45 0.15 250);
    --sidebar-primary-foreground: oklch(1.0 0 0);
    --sidebar-accent: oklch(0.48 0.12 230);
    --sidebar-accent-foreground: oklch(1.0 0 0);
    --sidebar-border: oklch(0.90 0 0);
    --sidebar-ring: oklch(0.45 0.15 250);
    --font-sans: "Inter", sans-serif;
    --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    --font-mono: ui-monospace, monospace;
    --radius: 0.5rem;
    --shadow-x: 0px;
    --shadow-y: 1px;
    --shadow-blur: 3px;
    --shadow-spread: 0px;
    --shadow-opacity: 0.1;
    --shadow-color: hsl(0 0% 0%);
    --shadow-2xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
    --shadow-xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.10);
    --shadow-sm: 0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
    --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
    --shadow-md: 0px 2px 4px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10);
    --shadow-lg: 0px 4px 6px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10);
    --shadow-xl: 0px 8px 10px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10);
    --shadow-2xl: 0px 12px 24px 0px hsl(0 0% 0% / 0.15);
    --tracking-normal: -0.01em;
    --spacing: 0.25rem;
  }

  #lp-preview-area.dark {
    --background: oklch(0.12 0 0);
    --foreground: oklch(0.95 0 0);
    --card: oklch(0.16 0 0);
    --card-foreground: oklch(0.95 0 0);
    --popover: oklch(0.16 0 0);
    --popover-foreground: oklch(0.95 0 0);
    --primary: oklch(0.60 0.18 250);
    --primary-foreground: oklch(1.0 0 0);
    --secondary: oklch(0.65 0.10 200);
    --secondary-foreground: oklch(0.12 0 0);
    --muted: oklch(0.20 0 0);
    --muted-foreground: oklch(0.65 0 0);
    --accent: oklch(0.62 0.15 230);
    --accent-foreground: oklch(1.0 0 0);
    --destructive: oklch(0.65 0.24 25);
    --destructive-foreground: oklch(1.0 0 0);
    --border: oklch(0.25 0 0);
    --input: oklch(0.25 0 0);
    --ring: oklch(0.60 0.18 250);
    --chart-1: oklch(0.60 0.18 250);
    --chart-2: oklch(0.65 0.10 200);
    --chart-3: oklch(0.62 0.15 230);
    --chart-4: oklch(0.65 0.24 25);
    --chart-5: oklch(0.63 0.12 180);
    --sidebar: oklch(0.10 0 0);
    --sidebar-foreground: oklch(0.95 0 0);
    --sidebar-primary: oklch(0.60 0.18 250);
    --sidebar-primary-foreground: oklch(1.0 0 0);
    --sidebar-accent: oklch(0.62 0.15 230);
    --sidebar-accent-foreground: oklch(1.0 0 0);
    --sidebar-border: oklch(0.25 0 0);
    --sidebar-ring: oklch(0.60 0.18 250);
    --font-sans: "Inter", sans-serif;
    --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    --font-mono: ui-monospace, monospace;
    --radius: 0.5rem;
    --shadow-x: 0px;
    --shadow-y: 1px;
    --shadow-blur: 3px;
    --shadow-spread: 0px;
    --shadow-opacity: 0.2;
    --shadow-color: hsl(0 0% 0%);
    --shadow-2xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.10);
    --shadow-xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.20);
    --shadow-sm: 0px 1px 3px 0px hsl(0 0% 0% / 0.20), 0px 1px 2px -1px hsl(0 0% 0% / 0.20);
    --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.20), 0px 1px 2px -1px hsl(0 0% 0% / 0.20);
    --shadow-md: 0px 2px 4px 0px hsl(0 0% 0% / 0.20), 0px 2px 4px -1px hsl(0 0% 0% / 0.20);
    --shadow-lg: 0px 4px 6px 0px hsl(0 0% 0% / 0.20), 0px 4px 6px -1px hsl(0 0% 0% / 0.20);
    --shadow-xl: 0px 8px 10px 0px hsl(0 0% 0% / 0.20), 0px 8px 10px -1px hsl(0 0% 0% / 0.20);
    --shadow-2xl: 0px 12px 24px 0px hsl(0 0% 0% / 0.30);
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
  }`;
}
