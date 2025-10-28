import { translate } from "@packages/localization";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@packages/ui/components/alert-dialog";
import { Button } from "@packages/ui/components/button";
import {
   Credenza,
   CredenzaContent,
   CredenzaFooter,
   CredenzaHeader,
   CredenzaTitle,
} from "@packages/ui/components/credenza";
import { Dropzone } from "@packages/ui/components/dropzone";
import { useAppForm } from "@packages/ui/components/form";
import { Input } from "@packages/ui/components/input";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { betterAuthClient } from "@/integrations/clients";

const profileSchema = z.object({
   image: z.literal(null),
   name: z
      .string()
      .min(
         1,
         translate(
            "pages.profile.forms.update-profile.validation.name-required",
         ),
      ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function UpdateProfileForm({
   open,
   onOpenChange,
   currentName,
   currentImage,
}: {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   currentName: string;
   currentImage: string;
}) {
   const [confirmOpen, setConfirmOpen] = useState(false);
   const [imageFile, setImageFile] = useState<File | null>(null);
   const handleUpdateProfile = useCallback(
      async (value: ProfileFormValues, formApi: { reset: () => void }) => {
         const imageUrl = currentImage;
         if (imageFile) {
            // TODO: implement image upload and return URL
            // Example: const uploaded = await uploadProfileImage(imageFile);
            // imageUrl = uploaded.url;
         }
         await betterAuthClient.updateUser(
            {
               image: imageUrl,
               name: value.name,
            },
            {
               onError: ({ error }: { error: Error }) => {
                  toast.error(
                     error?.message ||
                        translate(
                           "pages.profile.forms.update-profile.messages.error",
                        ),
                  );
               },
               onRequest: () => {
                  toast.loading(
                     translate(
                        "pages.profile.forms.update-profile.messages.loading",
                     ),
                  );
               },
               onSuccess: () => {
                  toast.success(
                     translate(
                        "pages.profile.forms.update-profile.messages.success",
                     ),
                  );
                  formApi.reset();
                  onOpenChange(false);
               },
            },
         );
      },
      [currentImage, imageFile, onOpenChange],
   );
   const form = useAppForm({
      defaultValues: { image: null, name: currentName },
      onSubmit: async ({ value, formApi }) => {
         await handleUpdateProfile(value, formApi);
      },
      validators: { onBlur: profileSchema },
   });
   return (
      <Credenza onOpenChange={onOpenChange} open={open}>
         <CredenzaContent>
            <CredenzaHeader>
               <CredenzaTitle>
                  {translate("pages.profile.forms.update-profile.title")}
               </CredenzaTitle>
            </CredenzaHeader>
            <form
               autoComplete="off"
               className="space-y-4 py-4"
               onSubmit={form.handleSubmit}
            >
               <form.AppField name="name">
                  {(field) => (
                     <field.FieldContainer>
                        <field.FieldLabel>
                           {translate(
                              "pages.profile.forms.update-profile.fields.name.label",
                           )}
                        </field.FieldLabel>
                        <Input
                           autoComplete="name"
                           id={field.name}
                           name={field.name}
                           onBlur={field.handleBlur}
                           onChange={(e) => field.handleChange(e.target.value)}
                           placeholder={translate(
                              "pages.profile.forms.update-profile.fields.name.placeholder",
                           )}
                           type="text"
                           value={field.state.value}
                        />
                        <field.FieldMessage />
                     </field.FieldContainer>
                  )}
               </form.AppField>{" "}
               <div>
                  <label className="text-sm font-medium">
                     {translate(
                        "pages.profile.forms.update-profile.fields.image.label",
                     )}
                  </label>
                  <Dropzone
                     accept={{ "image/*": [] }}
                     maxFiles={1}
                     maxSize={2 * 1024 * 1024}
                     onDrop={(files) => setImageFile(files[0] || null)}
                  >
                     {imageFile ? (
                        <img
                           alt="Preview"
                           className="h-20 w-20 rounded-full object-cover mx-auto"
                           src={URL.createObjectURL(imageFile)}
                        />
                     ) : (
                        currentImage && (
                           <img
                              alt="Current"
                              className="h-20 w-20 rounded-full object-cover mx-auto"
                              src={currentImage}
                           />
                        )
                     )}
                  </Dropzone>
               </div>
               <CredenzaFooter>
                  <Button
                     onClick={() => onOpenChange(false)}
                     type="button"
                     variant="outline"
                  >
                     {translate(
                        "pages.profile.forms.update-profile.actions.cancel",
                     )}
                  </Button>
                  <form.Subscribe>
                     {(formState) => (
                        <Button
                           disabled={!formState.canSubmit}
                           onClick={() => setConfirmOpen(true)}
                           type="button"
                        >
                           {translate(
                              "pages.profile.forms.update-profile.actions.save",
                           )}
                        </Button>
                     )}
                  </form.Subscribe>{" "}
               </CredenzaFooter>
            </form>
            <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
               <AlertDialogContent>
                  <AlertDialogHeader>
                     <AlertDialogTitle>
                        {translate(
                           "pages.profile.forms.update-profile.confirm.title",
                        )}
                     </AlertDialogTitle>
                     <AlertDialogDescription>
                        {translate(
                           "pages.profile.forms.update-profile.confirm.description",
                        )}
                     </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                     <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
                        {translate(
                           "pages.profile.forms.update-profile.confirm.cancel",
                        )}
                     </AlertDialogCancel>
                     <AlertDialogAction
                        onClick={() => {
                           setConfirmOpen(false);
                           form.handleSubmit();
                        }}
                     >
                        {translate(
                           "pages.profile.forms.update-profile.confirm.confirm",
                        )}
                     </AlertDialogAction>
                  </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>
         </CredenzaContent>
      </Credenza>
   );
}
