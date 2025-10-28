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
import { useAppForm } from "@packages/ui/components/form";
import { Input } from "@packages/ui/components/input";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { betterAuthClient } from "@/integrations/clients";

const passwordSchema = z.object({
   currentPassword: z
      .string()
      .min(
         1,
         translate(
            "pages.profile.forms.update-password.validation.current-required",
         ),
      ),
   newPassword: z
      .string()
      .min(
         8,
         translate(
            "pages.profile.forms.update-password.validation.new-min-length",
         ),
      ),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function UpdatePasswordForm({
   open,
   onOpenChange,
}: {
   open: boolean;
   onOpenChange: (open: boolean) => void;
}) {
   const [confirmOpen, setConfirmOpen] = useState(false);
   const handleChangePassword = useCallback(
      async (value: PasswordFormValues, formApi: { reset: () => void }) => {
         await betterAuthClient.changePassword(
            {
               currentPassword: value.currentPassword,
               newPassword: value.newPassword,
               revokeOtherSessions: true,
            },
            {
               onError: ({ error }: { error: Error }) => {
                  toast.error(
                     error?.message ||
                        translate(
                           "pages.profile.forms.update-password.messages.error",
                        ),
                  );
               },
               onRequest: () => {
                  toast.loading(
                     translate(
                        "pages.profile.forms.update-password.messages.loading",
                     ),
                  );
               },
               onSuccess: () => {
                  toast.success(
                     translate(
                        "pages.profile.forms.update-password.messages.success",
                     ),
                  );
                  formApi.reset();
                  onOpenChange(false);
               },
            },
         );
      },
      [onOpenChange],
   );
   const form = useAppForm({
      defaultValues: { currentPassword: "", newPassword: "" },
      onSubmit: async ({ value, formApi }) => {
         await handleChangePassword(value, formApi);
      },
      validators: { onBlur: passwordSchema },
   });
   return (
      <Credenza onOpenChange={onOpenChange} open={open}>
         <CredenzaContent>
            <CredenzaHeader>
               <CredenzaTitle>
                  {translate("pages.profile.forms.update-password.title")}
               </CredenzaTitle>
            </CredenzaHeader>
            <form
               autoComplete="off"
               className="space-y-4 py-4"
               onSubmit={form.handleSubmit}
            >
               <form.AppField name="currentPassword">
                  {(field) => (
                     <field.FieldContainer>
                        <field.FieldLabel>
                           {translate(
                              "pages.profile.forms.update-password.fields.current-password.label",
                           )}
                        </field.FieldLabel>
                        <Input
                           autoComplete="current-password"
                           id={field.name}
                           name={field.name}
                           onBlur={field.handleBlur}
                           onChange={(e) => field.handleChange(e.target.value)}
                           placeholder={translate(
                              "pages.profile.forms.update-password.fields.current-password.placeholder",
                           )}
                           type="password"
                           value={field.state.value}
                        />
                        <field.FieldMessage />
                     </field.FieldContainer>
                  )}
               </form.AppField>{" "}
               <form.AppField name="newPassword">
                  {(field) => (
                     <field.FieldContainer>
                        <field.FieldLabel>
                           {translate(
                              "pages.profile.forms.update-password.fields.new-password.label",
                           )}
                        </field.FieldLabel>
                        <Input
                           autoComplete="new-password"
                           id={field.name}
                           name={field.name}
                           onBlur={field.handleBlur}
                           onChange={(e) => field.handleChange(e.target.value)}
                           placeholder={translate(
                              "pages.profile.forms.update-password.fields.new-password.placeholder",
                           )}
                           type="password"
                           value={field.state.value}
                        />
                        <field.FieldMessage />
                     </field.FieldContainer>
                  )}
               </form.AppField>{" "}
               <CredenzaFooter>
                  <Button
                     onClick={() => onOpenChange(false)}
                     type="button"
                     variant="outline"
                  >
                     {translate(
                        "pages.profile.forms.update-password.actions.cancel",
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
                              "pages.profile.forms.update-password.actions.change",
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
                           "pages.profile.forms.update-password.confirm.title",
                        )}
                     </AlertDialogTitle>
                     <AlertDialogDescription>
                        {translate(
                           "pages.profile.forms.update-password.confirm.description",
                        )}
                     </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                     <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
                        {translate(
                           "pages.profile.forms.update-password.confirm.cancel",
                        )}
                     </AlertDialogCancel>
                     <AlertDialogAction
                        onClick={() => {
                           setConfirmOpen(false);
                           form.handleSubmit();
                        }}
                     >
                        {translate(
                           "pages.profile.forms.update-password.confirm.confirm",
                        )}
                     </AlertDialogAction>
                  </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>
         </CredenzaContent>
      </Credenza>
   );
}
