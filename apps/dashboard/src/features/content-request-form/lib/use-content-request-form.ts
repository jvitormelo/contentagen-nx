import {
   type ContentRequest,
   ContentRequestSchema,
} from "@packages/database/schemas/content";
import { useAppForm } from "@packages/ui/components/form";
import { type FormEvent, useCallback } from "react";

export type ContentRequestFormData = ContentRequest;

export type ContentRequestFormProps = {
   defaultValues?: Partial<ContentRequestFormData>;
   onSubmit: (values: ContentRequestFormData) => Promise<void>;
};

export function useContentRequestForm({
   defaultValues,
   onSubmit,
}: ContentRequestFormProps) {
   const form = useAppForm({
      defaultValues: {
         description: defaultValues?.description || "",
         layout: defaultValues?.layout || "article",
      } as ContentRequestFormData,
      onSubmit: async ({ value }) => {
         await onSubmit(value);
      },
      validators: {
         onBlur: ContentRequestSchema,
      },
   });

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         e.stopPropagation();
         form.handleSubmit();
      },
      [form],
   );

   return {
      form,
      handleSubmit,
   };
}

export type ContentRequestForm = ReturnType<
   typeof useContentRequestForm
>["form"];
