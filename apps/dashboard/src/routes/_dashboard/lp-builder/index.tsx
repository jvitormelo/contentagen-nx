import { createFileRoute } from "@tanstack/react-router";
import { ExampleComponent } from "@packages/lp-blocks";

export const Route = createFileRoute("/_dashboard/lp-builder/")({
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <div>
         <h1>Hello "/_dashboard/lp-builder/"!</h1>
         <ExampleComponent />
      </div>
   );
}
