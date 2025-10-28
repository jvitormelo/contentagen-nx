import type { IdeaContentSchema, IdeaSelect } from "@packages/database/schema";
import { translate } from "@packages/localization";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@packages/ui/components/card";

interface IdeaContentCardProps {
   idea: IdeaSelect;
}

interface IdeaPreviewCardProps {
   idea: IdeaSelect;
}

function IdeaPreviewCard({ idea }: IdeaPreviewCardProps) {
   const content = idea.content as IdeaContentSchema;
   return (
      <article className="bg-accent rounded-lg border-primary group">
         <a className="block" href={`/ideas/${idea.id}`}>
            <div className="relative overflow-hidden">
               <img
                  alt="Blog post placeholder"
                  className="w-full h-48 rounded-t-lg object-cover"
                  src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fnorthgroupconsultants.com%2Fwp-content%2Fuploads%2FBlog-Post-Placeholder.png&f=1&nofb=1&ipt=75f75b304aa4358aa27974befe1d8d1f65afa476329c96500a121ee3d43da22e"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-4 grid gap-4">
               <h3 className="text-lg font-semibold text-foreground transition-colors line-clamp-2 leading-tight">
                  {content.title || "Untitled Idea"}
               </h3>
               <p className="text-sm text-muted-foreground">
                  {idea.createdAt
                     ? new Date(idea.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                       })
                     : translate("pages.idea-details.content.unknown-date")}
               </p>
               {content.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                     {content.description}
                  </p>
               )}
            </div>
         </a>
      </article>
   );
}

export function IdeaContentCard({ idea }: IdeaContentCardProps) {
   return (
      <Card>
         <CardHeader>
            <CardTitle>
               {translate("pages.idea-details.content.title")}
            </CardTitle>
            <CardDescription>
               {translate("pages.idea-details.content.description")}
            </CardDescription>
         </CardHeader>
         <CardContent>
            <IdeaPreviewCard idea={idea} />
         </CardContent>
      </Card>
   );
}
