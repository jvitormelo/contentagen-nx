import { Button } from "@packages/ui/components/button";
import {
   Card,
   CardAction,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@packages/ui/components/card";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import {
   Copy,
   Download,
   Eye,
   FileText,
   MoreVertical,
   Pencil,
   Sparkles,
} from "lucide-react";
import { marked } from "marked";
import { useEffect, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { toast } from "sonner";
import TurndownService from "turndown";
import { GeneratedContentEditor } from "./generated-content-editor";

// Initialize turndown service for HTML to Markdown conversion
const turndownService = new TurndownService({
   headingStyle: "atx",
   codeBlockStyle: "fenced",
});

// Configure marked options
marked.setOptions({
   breaks: true,
   gfm: true,
});

// Custom components for better markdown rendering
const MarkdownComponents: Components = {
   h1: ({ children }) => (
      <h1 className="text-2xl font-bold mb-4 text-foreground border-b border-border pb-2">
         {children}
      </h1>
   ),
   h2: ({ children }) => (
      <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>
   ),
   h3: ({ children }) => (
      <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>
   ),
   p: ({ children }) => (
      <p className="mb-4 text-foreground leading-relaxed">{children}</p>
   ),
   ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 text-foreground space-y-1">
         {children}
      </ul>
   ),
   ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 text-foreground space-y-1">
         {children}
      </ol>
   ),
   li: ({ children }) => <li className="text-foreground">{children}</li>,
   blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 mb-4 text-muted-foreground italic">
         {children}
      </blockquote>
   ),
   code: ({ children }) => (
      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">
         {children}
      </code>
   ),
   pre: ({ children }) => (
      <pre className="bg-muted p-4 rounded mb-4 overflow-x-auto text-sm font-mono text-foreground">
         {children}
      </pre>
   ),
   a: ({ href, children }) => (
      <a
         href={href}
         className="text-primary hover:text-primary/80 underline"
         target="_blank"
         rel="noopener noreferrer"
      >
         {children}
      </a>
   ),
   strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
   ),
   em: ({ children }) => <em className="italic text-foreground">{children}</em>,
   hr: () => <hr className="border-border my-6" />,
   table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
         <table className="min-w-full border border-border">{children}</table>
      </div>
   ),
   thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
   tbody: ({ children }) => <tbody>{children}</tbody>,
   tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
   th: ({ children }) => (
      <th className="px-4 py-2 text-left font-medium text-foreground">
         {children}
      </th>
   ),
   td: ({ children }) => (
      <td className="px-4 py-2 text-foreground">{children}</td>
   ),
};

function GenerationLoadingState() {
   return (
      <div className="text-center py-12">
         <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
            <div className="w-16 h-16 mx-auto mb-6"></div>
         </div>
         <div className="space-y-3">
            <p className="text-lg font-medium text-primary">
               AI Content Generation in Progress
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
               Our AI agent is crafting your content. This may take a few
               minutes depending on the complexity and length requested.
            </p>
            <div className="flex justify-center space-x-1 mt-4">
               <div
                  className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
               ></div>
               <div
                  className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
               ></div>
               <div
                  className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
               ></div>
            </div>
         </div>
      </div>
   );
}

interface GeneratedContentDisplayProps {
   generatedContent?: {
      body: string;
      wordsCount?: number;
      readTimeMinutes?: number;
      tags?: string[];
   } | null;
   isExporting: boolean;
   isGenerating?: boolean;
   onExport: (format: "html" | "markdown" | "mdx", content?: string) => void;
}

export function GeneratedContentDisplay({
   generatedContent,
   isExporting,
   isGenerating = false,
   onExport,
}: GeneratedContentDisplayProps) {
   const [isEditing, setIsEditing] = useState(false);
   const [showFullContent, setShowFullContent] = useState(false);
   const [editedMarkdown, setEditedMarkdown] = useState<string>("");

   useEffect(() => {
      if (generatedContent?.body) {
         setEditedMarkdown(generatedContent.body);
      }
   }, [generatedContent?.body]);

   const markdownToHtml = (markdown: string): string => {
      try {
         return marked(markdown) as string;
      } catch (error) {
         console.error("Error converting markdown to HTML:", error);
         return markdown;
      }
   };

   const htmlToMarkdown = (html: string): string => {
      try {
         return turndownService.turndown(html);
      } catch (error) {
         console.error("Error converting HTML to markdown:", error);
         return html;
      }
   };

   const handleCopyContent = () => {
      const contentToCopy = editedMarkdown || generatedContent?.body;
      if (contentToCopy) {
         navigator.clipboard.writeText(contentToCopy);
         toast.success("Content copied to clipboard");
      }
   };

   const handleSaveEdits = (htmlContent: string) => {
      const markdownContent = htmlToMarkdown(htmlContent);
      setEditedMarkdown(markdownContent);
      setIsEditing(false);
      toast.success(
         "Edits saved locally. You can now export the edited content.",
      );
   };

   const handleCancelEdit = () => {
      setEditedMarkdown(generatedContent?.body || "");
      setIsEditing(false);
   };

   const handleExport = (format: "html" | "markdown" | "mdx") => {
      const contentToExport = editedMarkdown || generatedContent?.body;
      onExport(format, contentToExport);
   };

   const displayContent = editedMarkdown || generatedContent?.body || "";
   const hasEdits = editedMarkdown !== generatedContent?.body;

   if (isEditing && generatedContent?.body) {
      return (
         <GeneratedContentEditor
            content={markdownToHtml(editedMarkdown)}
            onSave={handleSaveEdits}
            onCancel={handleCancelEdit}
         />
      );
   }

   return (
      <Card className={`h-fit   ${isGenerating ? "animate-pulse" : ""}`}>
         <CardHeader>
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                     Generated Content
                     {hasEdits && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                           Edited
                        </span>
                     )}
                     {isGenerating && (
                        <div className="flex items-center gap-1 text-primary">
                           <Sparkles className="h-4 w-4 animate-spin" />
                           <span className="text-sm font-normal">
                              Generating...
                           </span>
                        </div>
                     )}
                  </CardTitle>
                  <CardDescription>
                     {hasEdits
                        ? "Content has been edited locally. Export to save your changes."
                        : "Your AI-generated content with export and edit options"}
                  </CardDescription>
               </div>
               <div className="flex items-center gap-2">
                  {generatedContent && (
                     <div className="flex items-center gap-2">
                        <CardAction className="flex items-center gap-2">
                           <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setIsEditing(!isEditing)}
                           >
                              <Pencil className="h-4 w-4" />
                           </Button>
                        </CardAction>

                        <CardAction>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button
                                    size="icon"
                                    variant="outline"
                                    disabled={isExporting}
                                 >
                                    <MoreVertical className="h-4 w-4" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                 <DropdownMenuItem onClick={handleCopyContent}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Content
                                 </DropdownMenuItem>
                                 <DropdownMenuItem
                                    onClick={() => handleExport("markdown")}
                                 >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as Markdown
                                 </DropdownMenuItem>
                                 <DropdownMenuItem
                                    onClick={() => handleExport("mdx")}
                                 >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as MDX
                                 </DropdownMenuItem>
                                 <DropdownMenuItem
                                    onClick={() => handleExport("html")}
                                 >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as HTML
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </CardAction>
                     </div>
                  )}
               </div>
            </div>
         </CardHeader>
         <CardContent className="bg-muted mx-4 rounded-lg py-4">
            {!generatedContent && !isGenerating ? (
               <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No content generated yet</p>
                  <p className="text-sm">
                     Content will appear here once the request is approved and
                     generated.
                  </p>
               </div>
            ) : !generatedContent && isGenerating ? (
               <GenerationLoadingState />
            ) : (
               <div className="space-y-4">
                  <div className="text-sm">
                     {showFullContent ? (
                        <ReactMarkdown
                           rehypePlugins={[rehypeRaw]}
                           components={MarkdownComponents}
                        >
                           {displayContent}
                        </ReactMarkdown>
                     ) : (
                        <div className="relative">
                           <ReactMarkdown
                              rehypePlugins={[rehypeRaw]}
                              components={MarkdownComponents}
                           >
                              {(displayContent?.length || 0) > 2000
                                 ? displayContent?.substring(0, 2000) + "..."
                                 : displayContent || ""}
                           </ReactMarkdown>
                           {(displayContent?.length || 0) > 2000 && (
                              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                           )}
                        </div>
                     )}
                  </div>
               </div>
            )}
         </CardContent>
         <CardFooter>
            {(displayContent?.length || 0) > 2000 && (
               <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowFullContent(!showFullContent)}
               >
                  <Eye className="h-4 w-4 mr-2" />
                  {showFullContent ? "Show Less" : "Show More"}
               </Button>
            )}
         </CardFooter>
      </Card>
   );
}
