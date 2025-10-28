import type { RouterOutput } from "@packages/api/client";
import { Button } from "@packages/ui/components/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@packages/ui/components/dialog";
import { useAppForm } from "@packages/ui/components/form";
import { Input } from "@packages/ui/components/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useCallback } from "react";
import { z } from "zod";
import { createToast } from "@/features/error-modal/lib/create-toast";
import { useTRPC } from "@/integrations/clients";

const brandSchema = z.object({
   websiteUrl: z.url("Please enter a valid URL"),
});

interface CreateEditBrandDialogProps {
   brand?: RouterOutput["brand"]["list"]["items"][number];
   open: boolean;
   onOpenChange: (open: boolean) => void;
}

export function CreateEditBrandDialog({
   brand,
   open,
   onOpenChange,
}: CreateEditBrandDialogProps) {
   const trpc = useTRPC();
   const queryClient = useQueryClient();
   const isEditing = !!brand;

   const updateMutation = useMutation(
      trpc.brand.update.mutationOptions({
         onError: (error) => {
            createToast({
               message: `Failed to update brand: ${error.message ?? "Unknown error"}`,
               type: "danger",
            });
         },
         onSuccess: async () => {
            createToast({
               message: "Brand updated successfully",
               type: "success",
            });
            await queryClient.invalidateQueries({
               queryKey: trpc.brand.getByOrganization.queryKey(),
            });
            onOpenChange(false);
         },
      }),
   );

   const createMutation = useMutation(
      trpc.brand.create.mutationOptions({
         onError: (error) => {
            createToast({
               message: `Failed to create brand: ${error.message ?? "Unknown error"}`,
               type: "danger",
            });
         },
         onSuccess: async () => {
            createToast({
               message: "Brand created successfully",
               type: "success",
            });
            await queryClient.invalidateQueries({
               queryKey: trpc.brand.getByOrganization.queryKey(),
            });
            onOpenChange(false);
         },
      }),
   );
   const createBrand = useCallback(
      async (values: z.infer<typeof brandSchema>) => {
         await createMutation.mutateAsync(values);
      },
      [createMutation],
   );

   const updateBrand = useCallback(
      async (values: z.infer<typeof brandSchema>) => {
         if (!brand) return;
         await updateMutation.mutateAsync({
            data: values,
            id: brand.id,
         });
      },
      [updateMutation, brand],
   );

   const form = useAppForm({
      defaultValues: {
         websiteUrl: brand?.websiteUrl || "",
      },
      onSubmit: async ({ value, formApi }) => {
         if (isEditing) {
            await updateBrand(value);
         } else {
            await createBrand(value);
         }
         formApi.reset();
      },
      validators: {
         onChange: brandSchema,
      },
   });

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         e.stopPropagation();
         form.handleSubmit();
      },
      [form],
   );

   return (
      <Dialog onOpenChange={onOpenChange} open={open}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>
                  {isEditing ? "Edit Brand" : "Create New Brand"}
               </DialogTitle>
               <DialogDescription>
                  {isEditing
                     ? "Update your brand information and settings."
                     : "Create a new brand to start generating content and managing your brand assets."}
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
               <div className="grid gap-4 py-4">
                  <form.AppField name="websiteUrl">
                     {(field) => (
                        <field.FieldContainer>
                           <field.FieldLabel>Website URL</field.FieldLabel>
                           <Input
                              id={field.name}
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                 field.handleChange(e.target.value)
                              }
                              placeholder="https://example.com"
                              value={field.state.value}
                           />
                           <field.FieldMessage />
                        </field.FieldContainer>
                     )}
                  </form.AppField>
               </div>
               <DialogFooter>
                  <Button
                     onClick={() => onOpenChange(false)}
                     type="button"
                     variant="outline"
                  >
                     Cancel
                  </Button>
                  <form.Subscribe>
                     {(formState) => (
                        <Button
                           disabled={
                              !formState.canSubmit || formState.isSubmitting
                           }
                           type="submit"
                        >
                           {formState.isSubmitting
                              ? "Saving..."
                              : isEditing
                                ? "Save Changes"
                                : "Create Brand"}
                        </Button>
                     )}
                  </form.Subscribe>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
