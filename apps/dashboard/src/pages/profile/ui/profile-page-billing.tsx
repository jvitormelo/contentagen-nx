import { translate } from "@packages/localization";
import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import {
   Card,
   CardAction,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@packages/ui/components/card";
import { Progress } from "@packages/ui/components/progress";
import { Skeleton } from "@packages/ui/components/skeleton";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCallback } from "react";
import { betterAuthClient, useTRPC } from "@/integrations/clients";
import { SubscriptionPricingCards } from "@/widgets/subscription/ui/subscription-pricing-cards";

export function ProfilePageBilling() {
   const trpc = useTRPC();
   const { data: customerState, isLoading } = useSuspenseQuery(
      trpc.authHelpers.getCustomerState.queryOptions(),
   );
   const { data: isOwner, isLoading: isOwnerLoading } = useSuspenseQuery(
      trpc.authHelpers.isOrganizationOwner.queryOptions(),
   );
   const activeSubscription = customerState?.activeSubscriptions[0];
   const handleManageSubscription = useCallback(async () => {
      return await betterAuthClient.customer.portal();
   }, []);

   if (!isOwner) {
      return null;
   }

   if (isLoading || isOwnerLoading) {
      return (
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center">
                  <div className="flex items-center gap-2">
                     {translate("pages.profile.billing.loading")}
                     <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
               </CardTitle>
               <CardDescription>
                  <Skeleton className="h-4 w-64" />
               </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between mb-6">
                  <div>
                     <Skeleton className="h-8 w-32 mb-2" />
                     <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <h4 className="font-medium text-foreground mb-3">
                        {translate("pages.profile.billing.plan-features")}
                     </h4>
                     <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                           <div className="flex items-center" key={i}>
                              <Skeleton className="h-4 w-4 mr-2 rounded" />
                              <Skeleton className="h-4 w-full max-w-xs" />
                           </div>
                        ))}
                     </div>
                  </div>

                  <div>
                     <h4 className="font-medium text-foreground mb-3">
                        {translate(
                           "pages.profile.billing.usage-this-month-loading",
                        )}
                     </h4>
                     <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                           <div key={i}>
                              <div className="flex justify-between text-sm mb-1">
                                 <Skeleton className="h-4 w-24" />
                                 <Skeleton className="h-4 w-16" />
                              </div>
                              <Skeleton className="h-2 w-full rounded-full" />
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="flex space-x-3 mt-6">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-36" />
               </div>
            </CardContent>
         </Card>
      );
   }

   if (!activeSubscription) {
      return (
         <Card>
            <CardHeader>
               <CardTitle>
                  {translate("pages.profile.billing.no-active-plan")}
               </CardTitle>
               <CardDescription>
                  {translate(
                     "pages.profile.billing.no-active-plan-description",
                  )}
               </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <SubscriptionPricingCards />
            </CardContent>
         </Card>
      );
   }

   const formatCurrency = (amount: number, currency: string) => {
      return new Intl.NumberFormat("en-US", {
         currency: currency.toUpperCase(),
         style: "currency",
      }).format(amount / 100); // Assuming amount is in cents
   };

   const formatDate = (date: Date | null) => {
      if (!date) return "N/A";
      return new Intl.DateTimeFormat("en-US", {
         day: "numeric",
         month: "long",
         year: "numeric",
      }).format(new Date(date));
   };

   const computeMeterDetails = (
      meter: { consumedUnits: number; creditedUnits: number },
      subscriptionAmountCents: number,
      currency: string,
   ) => {
      const consumed = meter?.consumedUnits ?? 0;
      const credited = meter?.creditedUnits ?? 0;

      // If credited is -1 we treat it as unlimited / not priced per unit
      if (credited === -1 || credited === 0) {
         return {
            consumedAmountCents: 0,
            consumedFormatted: "—",
            perUnitCents: 0,
            perUnitFormatted: "—",
         };
      }

      // compute per-unit cost in cents (may be fractional) and total consumed amount in cents (float)
      const perUnitCentsFloat = subscriptionAmountCents / credited; // fractional cents per unit
      const consumedAmountCentsFloat = perUnitCentsFloat * consumed;

      // Format per-unit price with higher precision for very small values
      const formatCurrencyFlexible = (
         amountCents: number,
         currencyCode: string,
      ) => {
         const amountDollars = amountCents / 100;
         const absAmount = Math.abs(amountDollars);

         // If exactly zero, fall back to the normal formatter
         if (absAmount === 0) {
            return formatCurrency(Math.round(amountCents), currencyCode);
         }

         // For very small per-unit prices, show extra decimal places so value isn't rounded to $0.00
         if (absAmount < 0.01) {
            return new Intl.NumberFormat("en-US", {
               currency: currencyCode.toUpperCase(),
               maximumFractionDigits: 8,
               minimumFractionDigits: 6,
               style: "currency",
            }).format(amountDollars);
         }

         // Otherwise show regular 2-decimal currency
         return formatCurrency(Math.round(amountCents), currencyCode);
      };

      const consumedAmountCentsRounded = Math.round(consumedAmountCentsFloat);

      return {
         consumedAmountCents: consumedAmountCentsRounded,
         consumedFormatted: formatCurrency(
            consumedAmountCentsRounded,
            currency,
         ),
         perUnitCents: perUnitCentsFloat,
         perUnitFormatted: formatCurrencyFlexible(perUnitCentsFloat, currency),
      };
   };

   const calculateUsagePercentage = (consumed: number, credited: number) => {
      if (credited === 0) return 0;
      return Math.min((consumed / credited) * 100, 100);
   };

   const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
         case "active":
            return "bg-green-100 text-green-800";
         case "canceled":
            return "bg-red-100 text-red-800";
         case "past_due":
            return "bg-yellow-100 text-yellow-800";
         default:
            return "bg-gray-100 text-gray-800";
      }
   };

   // Compute meter details and usage percentage using the helper
   const selectedMeter =
      customerState?.activeMeters?.find((m) => (m?.creditedUnits ?? 0) > 0) ??
      customerState?.activeMeters?.[0];

   const meterDetails = selectedMeter
      ? computeMeterDetails(
           selectedMeter as { consumedUnits: number; creditedUnits: number },
           activeSubscription?.amount ?? 0,
           activeSubscription?.currency ?? "USD",
        )
      : null;

   const usagePercentage = calculateUsagePercentage(
      selectedMeter?.consumedUnits ?? 0,
      selectedMeter?.creditedUnits ?? 0,
   );
   const isNearLimit = usagePercentage > 80;

   return (
      <Card>
         <CardHeader>
            <CardTitle>
               {translate("pages.profile.billing.current-plan-title")}
            </CardTitle>
            <CardDescription>
               {translate("pages.profile.billing.current-plan-description")}
            </CardDescription>
            <CardAction>
               <Button onClick={handleManageSubscription} variant="outline">
                  {translate("pages.profile.billing.manage-subscription")}
               </Button>
            </CardAction>
         </CardHeader>
         <CardContent>
            <div className="flex items-center justify-between mb-6">
               <div>
                  <h3 className="text-2xl font-bold text-foreground">
                     {formatCurrency(
                        activeSubscription.amount,
                        activeSubscription.currency,
                     )}
                     <span className="text-base font-normal text-foreground/70">
                        /{activeSubscription.recurringInterval}
                     </span>
                  </h3>
                  <p className="text-sm text-foreground/70">
                     {translate("pages.profile.billing.next-billing")}{" "}
                     {formatDate(activeSubscription.currentPeriodEnd)}
                  </p>
               </div>
               <Badge
                  className={getStatusColor(activeSubscription.status)}
                  variant="secondary"
               >
                  {activeSubscription.status.charAt(0).toUpperCase() +
                     activeSubscription.status.slice(1)}
               </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <h4 className="font-medium text-foreground mb-3">
                     {translate("pages.profile.billing.usage-this-month")}
                  </h4>
                  <div className="space-y-4">
                     {selectedMeter ? (
                        <div key={selectedMeter.id}>
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                 Usage:{" "}
                                 {selectedMeter.consumedUnits.toLocaleString()}{" "}
                                 /{" "}
                                 {selectedMeter.creditedUnits === -1
                                    ? "∞"
                                    : selectedMeter.creditedUnits.toLocaleString()}{" "}
                                 {translate(
                                    "pages.profile.billing.usage-units",
                                 )}
                              </span>
                              {meterDetails?.consumedFormatted && (
                                 <span className="text-sm font-semibold text-green-600">
                                    {meterDetails.consumedFormatted}
                                 </span>
                              )}
                           </div>
                           <Progress className="h-2" value={usagePercentage} />
                           <div className="flex justify-between text-xs text-foreground/60 mt-1">
                              <span>
                                 {translate("pages.profile.billing.remaining")}{" "}
                                 {selectedMeter.creditedUnits === -1
                                    ? "∞"
                                    : (
                                         selectedMeter.creditedUnits -
                                         selectedMeter.consumedUnits
                                      ).toLocaleString()}{" "}
                                 {translate(
                                    "pages.profile.billing.usage-units",
                                 )}
                              </span>
                              {meterDetails &&
                                 selectedMeter.creditedUnits !== -1 && (
                                    <span>
                                       {translate(
                                          "pages.profile.billing.remaining-value",
                                       )}{" "}
                                       {formatCurrency(
                                          Math.round(
                                             (selectedMeter.creditedUnits -
                                                selectedMeter.consumedUnits) *
                                                meterDetails.perUnitCents,
                                          ),
                                          activeSubscription?.currency ?? "USD",
                                       )}
                                    </span>
                                 )}
                           </div>
                           {isNearLimit &&
                              selectedMeter.creditedUnits !== -1 && (
                                 <p className="text-xs text-orange-600 mt-1 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {translate(
                                       "pages.profile.billing.approaching-limit",
                                    )}
                                 </p>
                              )}
                        </div>
                     ) : (
                        <p className="text-sm text-foreground/60">
                           {translate("pages.profile.billing.no-usage-meters")}
                        </p>
                     )}
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>
   );
}
