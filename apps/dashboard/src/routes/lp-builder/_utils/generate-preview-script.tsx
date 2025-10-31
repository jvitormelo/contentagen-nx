import fs from "node:fs";
import path from "node:path";
import {
   defaultContent,
   HeroSection1,
} from "@packages/ui/blocks/hero-section-one";
import { Renderer } from "@takumi-rs/core";
import { fromJsx } from "@takumi-rs/helpers/jsx";

const renderer = new Renderer({
   loadDefaultFonts: true,
});

// Create a Takumi-optimized hero section using pure nodes with inline styles
const node = await fromJsx(
   <HeroSection1 content={defaultContent}></HeroSection1>,
);

const imageBuffer = await renderer.render(node, {
   height: 1920,
   width: 1080,
});

const outputPath = path.join(process.cwd(), "./preview-image.webp");
fs.writeFileSync(outputPath, imageBuffer);
console.log(`Image saved to ${outputPath}`);
