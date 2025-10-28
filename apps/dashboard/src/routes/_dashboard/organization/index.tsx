import { createFileRoute } from "@tanstack/react-router";
import { OrganizationOverviewPage } from "@/pages/organization-overview/ui/organization-overview-page";

export const Route = createFileRoute("/_dashboard/organization/")({
   component: RouteComponent,
});

function RouteComponent() {
   return <OrganizationOverviewPage />;
}
