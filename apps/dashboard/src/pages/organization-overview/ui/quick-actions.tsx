import { Button } from "@packages/ui/components/button";
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from "@packages/ui/components/tooltip";
import { Edit, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { DeleteOrganizationFeature } from "../features/delete-organization";
import { EditOrganizationFeature } from "../features/edit-organization";
import { UploadOrganizationLogoFeature } from "../features/upload-organization-logo";

export function QuickActions() {
   const [_1, setDeleteDialogOpen] = useState(false);
   const [_2, setEditDialogOpen] = useState(false);
   const [_3, setUploadDialogOpen] = useState(false);

   const handleDelete = () => {
      setDeleteDialogOpen(true);
   };

   const handleEdit = () => {
      setEditDialogOpen(true);
   };

   const handleUpload = () => {
      setUploadDialogOpen(true);
   };

   const actions = [
      {
         Component: EditOrganizationFeature,
         icon: Edit,
         label: "Edit Organization",
         onClick: handleEdit,
      },
      {
         Component: UploadOrganizationLogoFeature,
         icon: Upload,
         label: "Upload Organization Logo",
         onClick: handleUpload,
      },
      {
         Component: DeleteOrganizationFeature,
         icon: Trash2,
         label: "Delete Organization",
         onClick: handleDelete,
      },
   ];

   return (
      <>
         <div className="w-full flex items-center justify-center gap-4">
            {actions.map((action, index) => (
               <Tooltip key={`org-action-${index + 1}`}>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={action.onClick}
                        size="icon"
                        variant="outline"
                     >
                        <action.icon />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>{action.label}</TooltipContent>
               </Tooltip>
            ))}
         </div>

         {/* Feature Components */}
         <DeleteOrganizationFeature
            onDelete={() => setDeleteDialogOpen(false)}
         />
         <EditOrganizationFeature onEdit={() => setEditDialogOpen(false)} />
         <UploadOrganizationLogoFeature />
      </>
   );
}
