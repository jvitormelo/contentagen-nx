import {
   FeaturesOne,
   defaultContent as featuresOneDefault,
} from "@packages/ui/blocks/features-one";
import {
   FooterSection,
   defaultContent as footerOneDefault,
} from "@packages/ui/blocks/footer-one";
import {
   HeroSection1,
   defaultContent as heroSection1Default,
} from "@packages/ui/blocks/hero-section-one";
import {
   PricingTable,
   defaultContent as pricingTableDefault,
} from "@packages/ui/blocks/pricing-table";
import type React from "react";

export type BlockCategory =
   | "hero"
   | "features"
   | "footer"
   | "cta"
   | "testimonial"
   | "pricing";

export interface BlockDefinition {
   id: string;
   name: string;
   category: BlockCategory;
   description: string;
   component: React.ComponentType<any>;
   defaultContent: any;
   thumbnail?: string;
   propsConfig: any[];
}

export const BLOCK_REGISTRY: Record<string, BlockDefinition> = {
   "features-one": {
      category: "features",
      component: FeaturesOne,
      defaultContent: featuresOneDefault,
      description: "Features section with table, cards, and testimonial",
      id: "features-one",
      name: "Features Section 1",
      propsConfig: [
         {
            group: "Content",
            key: "title",
            label: "Title",
            type: "text" as const,
         },
         {
            group: "Content",
            key: "description",
            label: "Description",
            type: "textarea" as const,
         },
         {
            arrayItemSchema: [
               { key: "id", label: "ID", type: "text" as const },
               { key: "date", label: "Date", type: "text" as const },
               { key: "status", label: "Status", type: "text" as const },
               {
                  key: "statusColor",
                  label: "Status Color",
                  options: ["green", "orange", "red"],
                  type: "select" as const,
               },
               { key: "customer", label: "Customer", type: "text" as const },
               { key: "revenue", label: "Revenue", type: "text" as const },
            ],
            group: "Table Data",
            key: "tableRows",
            label: "Table Rows",
            type: "array" as const,
         },
         {
            arrayItemSchema: [
               { key: "title", label: "Title", type: "text" as const },
               {
                  key: "description",
                  label: "Description",
                  type: "textarea" as const,
               },
            ],
            group: "Features",
            key: "features",
            label: "Feature Cards",
            type: "array" as const,
         },
         {
            group: "Testimonial",
            key: "testimonial.quote",
            label: "Quote",
            type: "textarea" as const,
         },
         {
            group: "Testimonial",
            key: "testimonial.author",
            label: "Author",
            type: "text" as const,
         },
         {
            group: "Testimonial",
            key: "testimonial.role",
            label: "Role",
            type: "text" as const,
         },
      ],
   },
   "footer-one": {
      category: "footer",
      component: FooterSection,
      defaultContent: footerOneDefault,
      description: "Simple footer with links and copyright",
      id: "footer-one",
      name: "Footer Section 1",
      propsConfig: [
         {
            group: "General",
            key: "homeLink",
            label: "Home Link",
            type: "url" as const,
         },
         {
            group: "General",
            key: "copyrightText",
            label: "Copyright Text",
            type: "text" as const,
         },
         {
            arrayItemSchema: [
               { key: "title", label: "Title", type: "text" as const },
               { key: "href", label: "URL", type: "url" as const },
            ],
            group: "Navigation",
            key: "links",
            label: "Footer Links",
            type: "array" as const,
         },
         {
            arrayItemSchema: [
               { key: "name", label: "Name", type: "text" as const },
               { key: "ariaLabel", label: "Aria Label", type: "text" as const },
               { key: "href", label: "URL", type: "url" as const },
               { key: "svgPath", label: "SVG Path", type: "textarea" as const },
               {
                  key: "svgViewBox",
                  label: "SVG ViewBox",
                  type: "text" as const,
               },
               {
                  key: "svgStrokeWidth",
                  label: "SVG Stroke Width",
                  type: "text" as const,
               },
               {
                  key: "svgColor",
                  label: "SVG Color",
                  type: "text" as const,
               },
            ],
            group: "Social Media",
            key: "socialLinks",
            label: "Social Links",
            type: "array" as const,
         },
      ],
   },
   "hero-section-1": {
      category: "hero",
      component: HeroSection1,
      defaultContent: heroSection1Default,
      description: "Modern hero section with image and CTA buttons",
      id: "hero-section-1",
      name: "Hero Section 1",
      propsConfig: [
         { key: "title", label: "Title", type: "text" as const },
         {
            key: "description",
            label: "Description",
            type: "textarea" as const,
         },
         {
            key: "primaryButtonText",
            label: "Primary Button Text",
            type: "text" as const,
         },
         {
            key: "primaryButtonLink",
            label: "Primary Button Link",
            type: "url" as const,
         },
         {
            key: "secondaryButtonText",
            label: "Secondary Button Text",
            type: "text" as const,
         },
         {
            key: "secondaryButtonLink",
            label: "Secondary Button Link",
            type: "url" as const,
         },
         {
            key: "trustedByText",
            label: "Trusted By Text",
            type: "text" as const,
         },
         { key: "imgUrl", label: "Image URL", type: "url" as const },
      ],
   },
   "pricing-table": {
      category: "pricing",
      component: PricingTable,
      defaultContent: pricingTableDefault,
      description: "Interactive pricing table with plan comparison",
      id: "pricing-table",
      name: "Pricing Table",
      propsConfig: [
         {
            group: "Labels",
            key: "monthlyLabel",
            label: "Monthly Label",
            type: "text" as const,
         },
         {
            group: "Labels",
            key: "yearlyLabel",
            label: "Yearly Label",
            type: "text" as const,
         },
         {
            group: "Labels",
            key: "monthLabel",
            label: "Month Label",
            type: "text" as const,
         },
         {
            group: "Labels",
            key: "yearLabel",
            label: "Year Label",
            type: "text" as const,
         },
         {
            group: "Labels",
            key: "popularLabel",
            label: "Popular Label",
            type: "text" as const,
         },
         {
            group: "Labels",
            key: "featuresHeaderLabel",
            label: "Features Header Label",
            type: "text" as const,
         },
         {
            group: "Labels",
            key: "buttonText",
            label: "Button Text",
            type: "text" as const,
         },
         {
            group: "Settings",
            key: "defaultPlan",
            label: "Default Plan",
            type: "text" as const,
         },
         {
            group: "Settings",
            key: "defaultInterval",
            label: "Default Interval",
            options: ["monthly", "yearly"],
            type: "select" as const,
         },
         {
            arrayItemSchema: [
               { key: "name", label: "Name", type: "text" as const },
               { key: "level", label: "Level", type: "text" as const },
               {
                  key: "price.monthly",
                  label: "Monthly Price",
                  type: "text" as const,
               },
               {
                  key: "price.yearly",
                  label: "Yearly Price",
                  type: "text" as const,
               },
               {
                  key: "popular",
                  label: "Popular",
                  options: ["true", "false"],
                  type: "select" as const,
               },
            ],
            group: "Plans",
            key: "plans",
            label: "Pricing Plans",
            type: "array" as const,
         },
         {
            arrayItemSchema: [
               { key: "name", label: "Feature Name", type: "text" as const },
               {
                  key: "included",
                  label: "Included In",
                  type: "text" as const,
               },
            ],
            group: "Features",
            key: "features",
            label: "Feature List",
            type: "array" as const,
         },
      ],
   },
};
export const ALL_BLOCKS: BlockDefinition[] = Object.values(BLOCK_REGISTRY);

export function getBlockDefinition(
   blockId: string,
): BlockDefinition | undefined {
   return BLOCK_REGISTRY[blockId];
}
