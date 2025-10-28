import { translate } from "@packages/localization";
import {
   Avatar,
   AvatarFallback,
   AvatarImage,
} from "@packages/ui/components/avatar";
import { Button } from "@packages/ui/components/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@packages/ui/components/card";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import { InfoItem } from "@packages/ui/components/info-item";
import {
   KeyIcon,
   Mail as MailIcon,
   MoreHorizontal,
   User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { betterAuthClient } from "@/integrations/clients";
import { UpdateEmailForm } from "../features/update-email-form";
import { UpdatePasswordForm } from "../features/update-password-form";
import { UpdateProfileForm } from "../features/update-profile-form";

export function ProfileInformation() {
   const { data: session } = betterAuthClient.useSession();
   const [showEmailModal, setShowEmailModal] = useState(false);
   const [showPasswordModal, setShowPasswordModal] = useState(false);
   const [showProfileModal, setShowProfileModal] = useState(false);

   // Helper for avatar fallback
   const getInitials = (name: string, email: string) => {
      if (name) {
         return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
      }
      return email ? email.slice(0, 2).toUpperCase() : "?";
   };

   return (
      <>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
               <div>
                  <CardTitle>
                     {translate("pages.profile.information.title")}
                  </CardTitle>
                  <CardDescription>
                     {translate("pages.profile.information.description")}
                  </CardDescription>
               </div>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">
                           {translate("pages.profile.information.more-options")}
                        </span>
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={() => setShowEmailModal(true)}>
                        <MailIcon className="h-4 w-4" />
                        {translate(
                           "pages.profile.information.actions.update-email",
                        )}
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onClick={() => setShowPasswordModal(true)}
                     >
                        <KeyIcon className="h-4 w-4" />
                        {translate(
                           "pages.profile.information.actions.update-password",
                        )}
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onClick={() => setShowProfileModal(true)}
                     >
                        <UserIcon className="h-4 w-4" />
                        {translate(
                           "pages.profile.information.actions.update-profile",
                        )}
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 md:flex-row">
               <Avatar className="h-20 w-20">
                  <AvatarImage
                     alt={session?.user?.name || "Profile picture"}
                     src={session?.user?.image || undefined}
                  />
                  <AvatarFallback className="text-lg">
                     {getInitials(
                        session?.user?.name || "",
                        session?.user?.email || "",
                     )}
                  </AvatarFallback>
               </Avatar>
               <div className="flex flex-col gap-4 w-full h-full">
                  <InfoItem
                     className="normal-case"
                     icon={<UserIcon className="h-4 w-4" />}
                     label={translate("pages.profile.information.fields.name")}
                     value={
                        session?.user?.name ||
                        translate("pages.profile.information.fields.anonymous")
                     }
                  />
                  <InfoItem
                     className="normal-case"
                     icon={<MailIcon className="h-4 w-4" />}
                     label={translate("pages.profile.information.fields.email")}
                     value={
                        session?.user?.email ||
                        translate("pages.profile.information.fields.no-email")
                     }
                  />
               </div>
            </CardContent>
         </Card>
         <UpdateEmailForm
            currentEmail={session?.user?.email || ""}
            onOpenChange={setShowEmailModal}
            open={showEmailModal}
         />
         <UpdatePasswordForm
            onOpenChange={setShowPasswordModal}
            open={showPasswordModal}
         />
         <UpdateProfileForm
            currentImage={session?.user?.image || ""}
            currentName={session?.user?.name || ""}
            onOpenChange={setShowProfileModal}
            open={showProfileModal}
         />
      </>
   );
}
