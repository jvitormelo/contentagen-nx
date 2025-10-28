import { Button } from "@packages/ui/components/button";
import { InfoItem } from "@packages/ui/components/info-item";
import { useLocation } from "@tanstack/react-router";
import { FileTextIcon } from "lucide-react";

import { useMemo } from "react";
import type { ContentRequestForm } from "../lib/use-content-request-form";

export function ReviewSubmitStep({ form }: { form: ContentRequestForm }) {
   const basicInfoItems = useMemo(
      () => [
         {
            className: "col-span-2",
            icon: <FileTextIcon className="w-4 h-4" />,
            label: "Headline of your content",
            value: String(form.getFieldValue("description") ?? ""),
         },
      ],
      [form],
   );

   return (
      <div className="space-y-4">
         <div>
            <div className="grid grid-cols-2 gap-4 text-sm">
               {basicInfoItems.map((item) => (
                  <div className={item.className} key={item.label}>
                     <InfoItem
                        icon={item.icon}
                        label={item.label}
                        value={item.value}
                     />
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}

export function ReviewSubmitStepSubscribe({
   form,
}: {
   form: ContentRequestForm;
}) {
   const pathname = useLocation({
      select: (location) => location.pathname,
   });
   const buttonTexts = useMemo(() => {
      const match = pathname.match(/^\/content\/requests\/[^/]+\/edit$/);
      return match
         ? { idle: "Edit Request", loading: "Editing..." }
         : { idle: "Create Request", loading: "Creating..." };
   }, [pathname]);
   return (
      <form.Subscribe
         selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
         })}
      >
         {({ canSubmit, isSubmitting }) => (
            <Button disabled={!canSubmit || isSubmitting} type="submit">
               {isSubmitting ? buttonTexts.loading : buttonTexts.idle}
            </Button>
         )}
      </form.Subscribe>
   );
}
