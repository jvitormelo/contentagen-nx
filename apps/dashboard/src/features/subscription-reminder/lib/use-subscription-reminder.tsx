import { useIsomorphicLayoutEffect } from "@packages/ui/hooks/use-isomorphic-layout-effect";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/integrations/clients";
import { SubscriptionReminderCredenza } from "../ui/subscription-reminder-credenza";

export function useSubscriptionReminder() {
   const [showReminder, setShowReminder] = useState(false);
   const trpc = useTRPC();

   const { data: shouldShow } = useSuspenseQuery(
      trpc.authHelpers.subscriptionReminder.queryOptions(),
   );

   useIsomorphicLayoutEffect(() => {
      if (!shouldShow) {
         setShowReminder(false);
         return;
      }

      const timer = setTimeout(() => {
         setShowReminder(true);
      }, 500);

      return () => clearTimeout(timer);
   }, [shouldShow]);

   const handleClose = () => {
      setShowReminder(false);
      toast.info(
         "You can upgrade your subscription anytime from the profile page to unlock all features.",
      );
   };

   const SubscriptionReminderComponent = () => (
      <SubscriptionReminderCredenza
         onOpenChange={handleClose}
         open={showReminder}
      />
   );

   return {
      SubscriptionReminderComponent,
      setShowReminder,
      showReminder,
   };
}
