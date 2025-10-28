import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/clients";

export const useBillingInfo = () => {
   const trpc = useTRPC();
   const { data: customerState, isLoading } = useSuspenseQuery(
      trpc.authHelpers.getCustomerState.queryOptions(),
   );
   return {
      activeMeter: customerState?.activeMeters[0],
      activeSubscription: customerState?.activeSubscriptions[0],
      customerState,
      isLoading,
   };
};
