import type { ContentSelect } from "@packages/database/schema";
import {
   Credenza,
   CredenzaBody,
   CredenzaContent,
   CredenzaDescription,
   CredenzaHeader,
   CredenzaTitle,
} from "@packages/ui/components/credenza";
import { Markdown } from "@packages/ui/components/markdown";
import { ScrollArea } from "@packages/ui/components/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/clients";

interface BlogPreviewCredenzaProps {
   content: ContentSelect;
   open?: boolean;
   onOpenChange?: (open: boolean) => void;
}

export function BlogPreviewCredenza({
   content,
   open,
   onOpenChange,
}: BlogPreviewCredenzaProps) {
   const trpc = useTRPC();

   // Fetch content image if imageUrl exists
   const { data: contentImage } = useQuery(
      trpc.content.images.getImage.queryOptions(
         { id: content.id },
         {
            enabled: !!content.imageUrl,
         },
      ),
   );

   // Fetch agent profile photo
   const { data: agentPhoto } = useQuery(
      trpc.agentFile.getProfilePhoto.queryOptions({ agentId: content.agentId }),
   );

   // Get agent data for name
   const { data: agentData } = useQuery(
      trpc.agent.get.queryOptions({ id: content.agentId }),
   );

   const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("en-US", {
         day: "numeric",
         month: "long",
         year: "numeric",
      }).format(date);
   };

   const authorName =
      agentData?.personaConfig?.metadata?.name || "ContentaGen Team";

   return (
      <Credenza onOpenChange={onOpenChange} open={open}>
         <CredenzaContent>
            <CredenzaHeader>
               <CredenzaTitle>Blog Post Preview</CredenzaTitle>
               <CredenzaDescription>
                  Preview how your blog post will appear to readers.
               </CredenzaDescription>
            </CredenzaHeader>

            <CredenzaBody className="max-h-96 overflow-y-auto">
               <ScrollArea className="h-full ">
                  <article className="space-y-4">
                     {contentImage?.data && (
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                           <img
                              alt={content.meta?.title ?? ""}
                              className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
                              src={contentImage.data}
                              style={{ maxHeight: "300px" }}
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                        </div>
                     )}

                     <div className="space-y-4">
                        <header className="text-center max-w-3xl mx-auto space-y-4">
                           <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                              {content.meta?.title ?? "Untitled"}
                           </h1>

                           <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 py-4 border-y border-primary">
                              <div className="flex items-center gap-2">
                                 {agentPhoto?.data && (
                                    <img
                                       alt={authorName}
                                       className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                                       src={agentPhoto.data}
                                    />
                                 )}
                                 <div>
                                    <span className="text-sm font-medium text-foreground">
                                       By {authorName}
                                    </span>
                                    <div className="text-xs text-muted-foreground">
                                       Author
                                    </div>
                                 </div>
                              </div>

                              <div className="flex flex-col sm:items-end gap-1">
                                 <div className="text-sm text-muted-foreground">
                                    {formatDate(new Date(content.createdAt))}
                                 </div>
                                 {content.stats?.readTimeMinutes && (
                                    <div className="text-sm text-muted-foreground">
                                       <span>
                                          {content.stats.readTimeMinutes} min
                                          read
                                       </span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </header>
                        <Markdown content={content.body ?? ""} />
                     </div>
                  </article>
               </ScrollArea>
            </CredenzaBody>
         </CredenzaContent>
      </Credenza>
   );
}
