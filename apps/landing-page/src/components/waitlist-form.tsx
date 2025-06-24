import { VITE_SERVER_URL } from "astro:env/client";
import { createEdenAdapter, type EdenClientType } from "@packages/eden";
import { Button } from "@packages/ui/components/button";
import { useAppForm } from "@packages/ui/components/form";
import { Input } from "@packages/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/select";
import type React from "react";
import { useCallback, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Toaster } from "@packages/ui/components/sonner";

type LeadType = Parameters<EdenClientType["waitlist"]["post"]>["0"]["leadType"];
export const WaitlistForm = () => {
  const eden = createEdenAdapter(VITE_SERVER_URL);

  const [leadTypes] = useState([
    "individual blogger",
    "marketing team",
    "freelance writer",
    "business owner",
    "other",
  ]);
  const schema = z.object({
    email: z.string().email("Please enter a valid email address"),
    leadType: z.enum(leadTypes as [LeadType, ...LeadType[]], {
      errorMap: () => ({ message: "Please select a lead type" }),
    }),
  });
  const form = useAppForm({
    defaultState: {},
    defaultValues: {
      email: "",
      leadType: "",
    },
    onSubmit: async (data) => {
      await eden.waitlist.post({
        email: data.value.email,
        leadType: data.value.leadType as LeadType,
      });
      toast.success("Thank you for joining the waitlist!");
      data.formApi.reset();
    },
    validators: {
      onChange: schema,
      onMount: (state) => {
        return schema.safeParse(state.value);
      },
    },
  });
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  }, []);
  return (
    <form className="w-full max-w-xl" onSubmit={(e) => handleSubmit(e)}>
      <Toaster />

      <div className="w-full space-y-4">
        <div className="flex gap-4">
          <form.AppField name="email">
            {(field) => (
              <field.FieldContainer className="w-full">
                <Input
                  autoComplete="email"
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your email"
                  type="email"
                  value={field.state.value}
                />
                <field.FieldMessage />
              </field.FieldContainer>
            )}
          </form.AppField>
          <form.Subscribe>
            {(formState) => (
              <Button
                className="  shadow-lg transition-all duration-300 group bg-primary shadow-primary/20 hover:bg-primary/90 flex gap-2 items-center justify-center"
                disabled={!formState.canSubmit || formState.isSubmitting}
                type="submit"
                variant="default"
              >
                Send
              </Button>
            )}
          </form.Subscribe>
        </div>
        <form.AppField name="leadType">
          {(field) => (
            <field.FieldContainer className="w-full">
              <Select
                onValueChange={(value) => field.handleChange(value)}
                value={field.state.value}
              >
                <SelectTrigger
                  className="w-full mt-2"
                  id={field.name}
                  name={field.name}
                >
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {leadTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/\b\w/g, (char) => char.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <field.FieldMessage />
            </field.FieldContainer>
          )}
        </form.AppField>
      </div>
    </form>
  );
};
