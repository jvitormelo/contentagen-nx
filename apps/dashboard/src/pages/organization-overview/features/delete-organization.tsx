import { DeleteConfirmationCredenza } from "@packages/ui/components/delete-confirmation-credenza";
import { useState } from "react";

interface DeleteOrganizationFeatureProps {
   onDelete?: () => void;
}

export function DeleteOrganizationFeature({
   onDelete,
}: DeleteOrganizationFeatureProps) {
   const [dialogOpen, setDialogOpen] = useState(false);

   const handleDelete = async () => {
      try {
         // TODO: Implement delete organization mutation
         console.log("Deleting organization...");
         onDelete?.();
         setDialogOpen(false);
      } catch (error) {
         console.error("Failed to delete organization:", error);
      }
   };

   return (
      <DeleteConfirmationCredenza
         message="Are you sure you want to delete this organization? This action cannot be undone and will permanently remove all organization data, including members, agents, and content."
         onDelete={handleDelete}
         onOpenChange={setDialogOpen}
         open={dialogOpen}
      />
   );
}
