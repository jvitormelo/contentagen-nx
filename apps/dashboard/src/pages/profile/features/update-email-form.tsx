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

const emailSchema = z.object({
   email: z
      .string()
      .email(
         translate("pages.profile.forms.update-email.validation.email-invalid"),
      ),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function UpdateEmailForm({
   open,
   onOpenChange,
   currentEmail,
}: {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   currentEmail: string;
}) {
   const [confirmOpen, setConfirmOpen] = useState(false);
   const handleChangeEmail = useCallback(
      async (value: EmailFormValues, formApi: { reset: () => void }) => {
         await betterAuthClient.changeEmail(
            {
               callbackURL: "/profile?emailChanged=1",
               newEmail: value.email,
            },
            {
               onError: ({ error }: { error: Error }) => {
                  toast.error(
                     error?.message ||
                        translate(
                           "pages.profile.forms.update-email.messages.error",
                        ),
                  );
               },
               onRequest: () => {
                  toast.loading(
                     translate(
                        "pages.profile.forms.update-email.messages.loading",
                     ),
                  );
               },
               onSuccess: () => {
                  toast.success(
                     translate(
                        "pages.profile.forms.update-email.messages.success",
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
      defaultValues: { email: currentEmail || "" },
      onSubmit: async ({ value, formApi }) => {
         await handleChangeEmail(value, formApi);
      },
      validators: { onBlur: emailSchema },
   });
   return (
      <Credenza onOpenChange={onOpenChange} open={open}>
         <CredenzaContent>
            <CredenzaHeader>
               <CredenzaTitle>
                  {translate("pages.profile.forms.update-email.title")}
               </CredenzaTitle>
            </CredenzaHeader>
            <form
               autoComplete="off"
               className="space-y-4 py-4"
               onSubmit={form.handleSubmit}
            >
               <div>
                  <label className="text-sm font-medium">
                     {translate(
                        "pages.profile.forms.update-email.fields.current-email.label",
                     )}
                  </label>
                  <Input className="bg-muted" disabled value={currentEmail} />
               </div>
               <form.AppField name="email">
                  {(field) => (
                     <field.FieldContainer>
                        <field.FieldLabel>
                           {translate(
                              "pages.profile.forms.update-email.fields.new-email.label",
                           )}
                        </field.FieldLabel>
                        <Input
                           autoComplete="email"
                           id={field.name}
                           name={field.name}
                           onBlur={field.handleBlur}
                           onChange={(e) => field.handleChange(e.target.value)}
                           placeholder={translate(
                              "pages.profile.forms.update-email.fields.new-email.placeholder",
                           )}
                           type="email"
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
                        "pages.profile.forms.update-email.actions.cancel",
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
                              "pages.profile.forms.update-email.actions.send",
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
                           "pages.profile.forms.update-email.confirm.title",
                        )}
                     </AlertDialogTitle>
                     <AlertDialogDescription>
                        {translate(
                           "pages.profile.forms.update-email.confirm.description",
                        )}
                     </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                     <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
                        {translate(
                           "pages.profile.forms.update-email.confirm.cancel",
                        )}
                     </AlertDialogCancel>
                     <AlertDialogAction
                        onClick={() => {
                           setConfirmOpen(false);
                           form.handleSubmit();
                        }}
                     >
                        {translate(
                           "pages.profile.forms.update-email.confirm.confirm",
                        )}
                     </AlertDialogAction>
                  </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>
         </CredenzaContent>
      </Credenza>
   );
}
