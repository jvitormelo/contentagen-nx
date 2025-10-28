import { translate } from "@packages/localization";
import {
   Card,
   CardAction,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@packages/ui/components/card";
import { Switch } from "@packages/ui/components/switch";
import {
   useMutation,
   useQueryClient,
   useSuspenseQuery,
} from "@tanstack/react-query";
import { createToast } from "@/features/error-modal/lib/create-toast";
import { useTRPC } from "@/integrations/clients";

export function WorkflowPreferences() {
   const trpc = useTRPC();
   // Fetch workflow preferences
   const { data } = useSuspenseQuery(
      trpc.preferences.getWorkflow.queryOptions(),
   );
   const queryClient = useQueryClient();
   const updateWorkflowMutation = useMutation(
      trpc.preferences.updateWorkflow.mutationOptions({
         onSuccess: async () => {
            await queryClient.invalidateQueries({
               queryKey: trpc.preferences.getWorkflow.queryKey(),
            });
         },
      }),
   );

   const handleToggleMissingImages = async (checked: boolean) => {
      try {
         await updateWorkflowMutation.mutateAsync({
            notifyMissingImages: checked,
         });

         createToast({
            message: translate("pages.profile.toast.preference-updated"),
            type: "success",
         });
      } catch (error) {
         createToast({
            message: translate("pages.profile.toast.preference-failed"),
            type: "danger",
         });
         console.error("Error updating workflow preference:", error);
      }
   };

   return (
      <Card>
         <CardHeader>
            <CardTitle>
               {translate("pages.profile.preferences.workflow.workflow-title")}
            </CardTitle>
            <CardDescription>
               {translate(
                  "pages.profile.preferences.workflow.workflow-description",
               )}
            </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
            <Card>
               <CardHeader>
                  <CardTitle>
                     {translate(
                        "pages.profile.preferences.workflow.missing-urls-title",
                     )}
                  </CardTitle>
                  <CardDescription>
                     {translate(
                        "pages.profile.preferences.workflow.missing-urls-description",
                     )}
                  </CardDescription>
                  <CardAction>
                     <Switch
                        checked={data.notifyMissingImages}
                        id="notify-missing-images"
                        onCheckedChange={handleToggleMissingImages}
                     />
                  </CardAction>
               </CardHeader>
            </Card>
         </CardContent>
      </Card>
   );
}
