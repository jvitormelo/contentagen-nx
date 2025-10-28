import { Button } from "@packages/ui/components/button";
import {
   Credenza,
   CredenzaBody,
   CredenzaContent,
   CredenzaFooter,
   CredenzaHeader,
   CredenzaTitle,
} from "@packages/ui/components/credenza";
import { useAppForm } from "@packages/ui/components/form";
import { Input } from "@packages/ui/components/input";
import { createSlug } from "@packages/utils/text";
import { useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { betterAuthClient, useTRPC } from "@/integrations/clients";
export function CreateOrganizationCredenza({
   open,
   onOpenChange,
}: {
   open: boolean;
   onOpenChange: (open: boolean) => void;
}) {
   const schema = z.object({
      name: z.string().min(1, "Please enter a name"),
   });
   const trpc = useTRPC();
   const queryClient = useQueryClient();

   const verifySlug = useCallback(async (slug: string) => {
      try {
         await betterAuthClient.organization.checkSlug({
            slug,
         });
         return true;
      } catch (e) {
         console.error("Error verifying slug:", e);
         return false;
      }
   }, []);
   const createOrganization = useCallback(
      async (values: z.infer<typeof schema>) => {
         const { name } = values;
         const slug = createSlug(name);
         const isSlugAvailable = await verifySlug(slug);
         if (!isSlugAvailable) {
            toast.error(
               `Slug "${slug}" is already taken. Please choose another.`,
            );
            return;
         }
         await betterAuthClient.organization.create(
            {
               name,
               slug,
            },
            {
               onError: (e) => {
                  console.error("Error creating organization:", e);
                  toast.error(`Failed to create organization`);
               },
               onSuccess: async ({ data }) => {
                  toast.success(
                     `Organization "${data.name}" created successfully`,
                  );
                  await queryClient.invalidateQueries({
                     queryKey:
                        trpc.authHelpers.getDefaultOrganization.queryKey(),
                  });
               },
            },
         );
      },
      [
         verifySlug,
         queryClient,
         trpc.authHelpers.getDefaultOrganization.queryKey,
         trpc.authHelpers.getDefaultOrganization,
      ],
   );

   const form = useAppForm({
      defaultValues: { name: "" },
      onSubmit: async ({ value, formApi }) => {
         await createOrganization(value);
         formApi.reset();
         onOpenChange(false);
      },
      validators: {
         onBlur: schema,
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
      <Credenza onOpenChange={onOpenChange} open={open}>
         <CredenzaContent>
            <CredenzaHeader>
               <CredenzaTitle>Create organization</CredenzaTitle>
            </CredenzaHeader>
            <form onSubmit={(e) => handleSubmit(e)}>
               <CredenzaBody>
                  <form.AppField name="name">
                     {(field) => (
                        <field.FieldContainer>
                           <field.FieldLabel>Name</field.FieldLabel>
                           <Input
                              id={field.name}
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                 field.handleChange(e.target.value)
                              }
                              placeholder="Enter a name for your organization"
                              value={field.state.value}
                           />
                           <field.FieldMessage />
                        </field.FieldContainer>
                     )}
                  </form.AppField>
               </CredenzaBody>
               <CredenzaFooter>
                  <form.Subscribe>
                     {(formState) => (
                        <Button
                           disabled={
                              !formState.canSubmit || formState.isSubmitting
                           }
                           type="submit"
                           variant="default"
                        >
                           Create Organization
                        </Button>
                     )}
                  </form.Subscribe>
               </CredenzaFooter>
            </form>
         </CredenzaContent>
      </Credenza>
   );
}
