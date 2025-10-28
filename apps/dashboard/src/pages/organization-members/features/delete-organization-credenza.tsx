import { Button } from "@packages/ui/components/button";
import {
   Credenza,
   CredenzaBody,
   CredenzaContent,
   CredenzaDescription,
   CredenzaFooter,
   CredenzaHeader,
   CredenzaTitle,
} from "@packages/ui/components/credenza";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { betterAuthClient, useTRPC } from "@/integrations/clients";

export function DeleteOrganizationCredenza({
   organizationId,
   open,
   onOpenChange,
}: {
   organizationId: string;
   open: boolean;
   onOpenChange: (open: boolean) => void;
}) {
   const queryClient = useQueryClient();
   const trpc = useTRPC();
   const handleDelete = useCallback(async () => {
      await betterAuthClient.organization.delete(
         {
            organizationId,
         },
         {
            onError: (error) => {
               console.error("Failed to delete organization", error);
               toast.error("Failed to delete organization. Please try again.");
            },
            onSuccess: async () => {
               toast.success("Organization deleted successfully");
               await queryClient.invalidateQueries({
                  queryKey: trpc.authHelpers.getDefaultOrganization.queryKey(),
               });
               onOpenChange(false);
            },
         },
      );
   }, [
      onOpenChange,
      organizationId,
      queryClient,
      trpc.authHelpers.getDefaultOrganization.queryKey,
      trpc.authHelpers.getDefaultOrganization,
   ]);

   return (
      <Credenza onOpenChange={onOpenChange} open={open}>
         <CredenzaContent>
            <CredenzaHeader>
               <CredenzaTitle>Delete Organization</CredenzaTitle>
               <CredenzaDescription>
                  This action will permanently delete your organization and all
                  its data.
               </CredenzaDescription>
            </CredenzaHeader>
            <CredenzaBody>
               <div className="text-red-700 font-semibold mb-2">
                  Are you sure you want to delete this organization? This cannot
                  be undone.
               </div>
            </CredenzaBody>
            <CredenzaFooter>
               <Button
                  className="w-full shadow-lg transition-all duration-300 group bg-red-600 shadow-red-600/20 hover:bg-red-700 flex gap-2 items-center justify-center"
                  onClick={handleDelete}
                  type="button"
               >
                  Delete Organization
               </Button>
            </CredenzaFooter>
         </CredenzaContent>
      </Credenza>
   );
}
