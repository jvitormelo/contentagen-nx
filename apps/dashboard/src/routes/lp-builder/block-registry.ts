import { defaultContent as featuresOneDefault } from "@packages/ui/blocks/features-one";
import { defaultContent as footerOneDefault } from "@packages/ui/blocks/footer-one";
import { defaultContent as heroSection1Default } from "@packages/ui/blocks/hero-section-one";
import type React from "react";

export type BlockCategory =
   | "hero"
   | "features"
   | "footer"
   | "cta"
   | "testimonial";

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
      component: null as any,
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
      component: null as any,
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
      component: null as any, // Will be loaded dynamically
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
};

export const BLOCK_CATEGORIES: Record<
   BlockCategory,
   { name: string; description: string }
> = {
   cta: {
      description: "Drive conversions with compelling CTAs",
      name: "Call to Action",
   },
   features: {
      description: "Showcase your product features and benefits",
      name: "Features",
   },
   footer: {
      description: "Page footers with links and information",
      name: "Footers",
   },
   hero: {
      description: "Eye-catching headers for your landing page",
      name: "Hero Sections",
   },
   testimonial: {
      description: "Build trust with customer testimonials",
      name: "Testimonials",
   },
};

export function getBlocksByCategory(
   category: BlockCategory,
): BlockDefinition[] {
   return Object.values(BLOCK_REGISTRY).filter(
      (block) => block.category === category,
   );
}

export function getBlockDefinition(
   blockId: string,
): BlockDefinition | undefined {
   return BLOCK_REGISTRY[blockId];
}
