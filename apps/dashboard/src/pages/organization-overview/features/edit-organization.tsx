import { Button } from "@packages/ui/components/button";
import {
   Credenza,
   CredenzaBody,
   CredenzaClose,
   CredenzaContent,
   CredenzaDescription,
   CredenzaFooter,
   CredenzaHeader,
   CredenzaTitle,
} from "@packages/ui/components/credenza";
import { Input } from "@packages/ui/components/input";
import { Label } from "@packages/ui/components/label";
import { useState } from "react";

interface EditOrganizationFeatureProps {
   onEdit?: (data: { name: string; slug: string }) => void;
}

export function EditOrganizationFeature({
   onEdit,
}: EditOrganizationFeatureProps) {
   const [dialogOpen, setDialogOpen] = useState(false);
   const [name, setName] = useState("");
   const [slug, setSlug] = useState("");

   const handleEdit = async () => {
      try {
         // TODO: Implement edit organization mutation
         console.log("Editing organization:", { name, slug });
         onEdit?.({ name, slug });
         setDialogOpen(false);
      } catch (error) {
         console.error("Failed to edit organization:", error);
      }
   };

   return (
      <Credenza onOpenChange={setDialogOpen} open={dialogOpen}>
         <CredenzaContent>
            <CredenzaHeader>
               <CredenzaTitle>Edit Organization</CredenzaTitle>
               <CredenzaDescription>
                  Update your organization details
               </CredenzaDescription>
            </CredenzaHeader>
            <CredenzaBody className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                     id="name"
                     onChange={(e) => setName(e.target.value)}
                     placeholder="Enter organization name"
                     value={name}
                  />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                     id="slug"
                     onChange={(e) => setSlug(e.target.value)}
                     placeholder="Enter organization slug"
                     value={slug}
                  />
               </div>
            </CredenzaBody>
            <CredenzaFooter className="grid grid-cols-2 gap-2">
               <CredenzaClose asChild>
                  <Button variant="outline">Cancel</Button>
               </CredenzaClose>
               <Button onClick={handleEdit}>Save Changes</Button>
            </CredenzaFooter>
         </CredenzaContent>
      </Credenza>
   );
}
