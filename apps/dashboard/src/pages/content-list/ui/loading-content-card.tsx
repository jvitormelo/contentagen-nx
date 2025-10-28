import { translate } from "@packages/localization";
import { Card, CardContent, CardHeader } from "@packages/ui/components/card";
import { Progress } from "@packages/ui/components/progress";
import { Skeleton } from "@packages/ui/components/skeleton";

interface LoadingContentCardProps {
   status: string | null;
   progress: number;
}

export function LoadingContentCard({
   status,
   progress,
}: LoadingContentCardProps) {
   return (
      <Card>
         <CardHeader>
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2" />
         </CardHeader>
         <CardContent className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                  <span className="capitalize font-medium">
                     {status || translate("common.messages.loading")}
                  </span>
                  <span>{progress}%</span>
               </div>
               <Progress className="w-full" value={progress} />
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
               <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" />
               <span>{translate("pages.content-details.content.loading")}</span>
            </div>
         </CardContent>
      </Card>
   );
}
