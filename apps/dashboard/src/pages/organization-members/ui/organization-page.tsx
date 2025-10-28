import { translate } from "@packages/localization";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@packages/ui/components/card";
import { InfoItem } from "@packages/ui/components/info-item";
import { useIsomorphicLayoutEffect } from "@packages/ui/hooks/use-isomorphic-layout-effect";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Building2, CalendarDays, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useTRPC } from "@/integrations/clients";
import { TalkingMascot } from "@/widgets/talking-mascot/ui/talking-mascot";
import { CreateOrganizationCredenza } from "../features/create-organization-credenza";
import { OrganizationPageMembersTable } from "./organization-page-members-table";

export function OrganizationPage() {
   const [open, setOpen] = useState(false);
   const trpc = useTRPC();
   const { data: org, isLoading: orgLoading } = useSuspenseQuery(
      trpc.authHelpers.getDefaultOrganization.queryOptions(),
   );

   const detailsInfoItems = useMemo(
      () => [
         {
            icon: <Building2 className="w-4 h-4" />,
            label: translate("pages.organization.fields.name"),
            value: org?.name ?? "—",
         },
         {
            icon: <CalendarDays className="w-4 h-4" />,
            label: translate("pages.organization.fields.created-at"),
            value: org?.createdAt
               ? new Date(org.createdAt).toLocaleString()
               : "—",
         },
         {
            icon: <Users className="w-4 h-4" />,
            label: translate("pages.organization.fields.members"),
            value: Array.isArray(org?.members)
               ? String(org.members.length)
               : "—",
         },
      ],
      [org],
   );

   useIsomorphicLayoutEffect(() => {
      if (!org && !orgLoading) setOpen(true);
   }, [org, orgLoading]);

   return (
      <div className="flex flex-col gap-4">
         <TalkingMascot message={"Bem vindo a sua organizacao"} />
         {org ? (
            <div className="grid  grid-cols-3 gap-4">
               <OrganizationPageMembersTable organization={org} />

               <div className="col-span-1 flex flex-col gap-4">
                  <Card>
                     <CardHeader>
                        <CardTitle>
                           {translate("pages.organization.details.title")}
                        </CardTitle>
                        <CardDescription>
                           {translate("pages.organization.details.description")}
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="grid gap-2">
                        {detailsInfoItems.map((item) => (
                           <InfoItem
                              icon={item.icon}
                              key={item.label}
                              label={item.label}
                              value={item.value}
                           />
                        ))}
                     </CardContent>
                  </Card>
               </div>
            </div>
         ) : (
            <div className="text-muted-foreground">
               {translate("pages.organization.messages.no-organization")}
            </div>
         )}
         <CreateOrganizationCredenza onOpenChange={setOpen} open={open} />
      </div>
   );
}
