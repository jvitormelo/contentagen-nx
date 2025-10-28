import { Button } from "@packages/ui/components/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@packages/ui/components/card";
import { Separator } from "@packages/ui/components/separator";
import { useCallback, useMemo } from "react";
import { betterAuthClient } from "@/integrations/clients";

export function SubscriptionPricingCards() {
   const plans = useMemo(
      () => [
         {
            buttonVariant: "default" as const,
            features: ["$5 of credits", "Pay as you go after"],
            name: "Basic",
            price: "$8 / mo",
            slug: "basic",
         },
         {
            buttonVariant: "outline" as const,
            features: [
               "$1 of credits",
               "Dont include additional usage",
               "No credit card required",
            ],
            name: "Hobby",
            price: "$0 / mo",
            slug: "hobby",
         },
      ],
      [],
   );

   const handleCheckout = useCallback(async (slug: string) => {
      return await betterAuthClient.checkout({
         slug,
      });
   }, []);

   return (
      <>
         {plans.map((plan) => (
            <Card key={plan.slug}>
               <CardHeader>
                  <CardDescription>{plan.name}</CardDescription>
                  <CardTitle>{plan.price}</CardTitle>
               </CardHeader>
               <CardContent>
                  <Button
                     className="w-full"
                     onClick={() => handleCheckout(plan.slug)}
                     variant={plan.buttonVariant}
                  >
                     Get Started
                  </Button>
               </CardContent>
               <CardFooter className="grid gap-4">
                  <Separator />
                  <ul className="list-disc list-inside space-y-1 text-sm">
                     {plan.features.map((feature, index) => (
                        <li key={`subscription-benefits-${index + 1}`}>
                           {feature}
                        </li>
                     ))}
                  </ul>
               </CardFooter>
            </Card>
         ))}
      </>
   );
}
