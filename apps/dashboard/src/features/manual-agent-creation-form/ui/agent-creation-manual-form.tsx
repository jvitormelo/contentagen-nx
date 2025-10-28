import {
   type PersonaConfig,
   PersonaConfigSchema,
} from "@packages/database/schemas/agent";
import { translate } from "@packages/localization";
import { Button } from "@packages/ui/components/button";
import { defineStepper } from "@packages/ui/components/stepper";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { TalkingMascot } from "@/widgets/talking-mascot/ui/talking-mascot";
import { useAgentForm } from "../lib/use-agent-form";
import { BasicInfoStep, BasicInfoStepSubscribe } from "./basic-info-step";
import { PurposeStep, PurposeStepSubscribe } from "./purpose-step";
import { ReviewStep, ReviewStepSubscribe } from "./review-step";
export const agentFormSchema = PersonaConfigSchema;
const steps = [
   {
      id: "step-basic-info",
      title: translate("pages.agent-creation-form.steps.basic-info"),
   },
   {
      id: "step-purpose",
      title: translate("pages.agent-creation-form.steps.purpose"),
   },
   {
      id: "step-review",
      title: translate("pages.agent-creation-form.steps.review"),
   },
] as const;
const { Stepper } = defineStepper(...steps);

export type AgentCreationManualForm = {
   defaultValues?: Partial<PersonaConfig>;
   onSubmit: (values: PersonaConfig) => Promise<void>;
   mode?: "create" | "edit";
};

export function AgentCreationManualForm({
   onSubmit,
   defaultValues,
   mode = "create",
}: AgentCreationManualForm) {
   const { handleSubmit, form } = useAgentForm({ defaultValues, onSubmit });

   const getMascotMessage = (step: (typeof steps)[number]["id"]) => {
      const messageType =
         mode === "edit" ? "mascot-messages-edit" : "mascot-messages";
      switch (step) {
         case "step-basic-info":
            return translate(
               `pages.agent-creation-form.${messageType}.basic-info`,
            );
         case "step-purpose":
            return translate(
               `pages.agent-creation-form.${messageType}.purpose`,
            );
         case "step-review":
            return translate(`pages.agent-creation-form.${messageType}.review`);
         default:
            return translate(
               `pages.agent-creation-form.${messageType}.default`,
            );
      }
   };
   return (
      <Stepper.Provider
         className="h-full w-full"
         labelOrientation="vertical"
         variant="horizontal"
      >
         {({ methods }) => (
            <form
               className="h-full gap-8 flex flex-col"
               onSubmit={handleSubmit}
            >
               <Stepper.Navigation>
                  {steps.map((step, idx) => {
                     const currentIdx = steps.findIndex(
                        (s) => s.id === methods.current.id,
                     );
                     const isPastOrCurrent = idx <= currentIdx;
                     return (
                        <Stepper.Step
                           className={`bg-accent!important text-accent ${!isPastOrCurrent ? "cursor-not-allowed opacity-50 pointer-events-none" : ""}`}
                           key={step.id}
                           of={step.id}
                           onClick={() => {
                              if (isPastOrCurrent && idx !== currentIdx) {
                                 methods.goTo(step.id);
                              }
                           }}
                        />
                     );
                  })}
               </Stepper.Navigation>

               <TalkingMascot message={getMascotMessage(methods.current.id)} />

               <Stepper.Panel className="h-full">
                  <AnimatePresence initial={false} mode="wait">
                     <motion.div
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full"
                        exit={{ opacity: 0, scale: 0.96 }}
                        initial={{ opacity: 0, scale: 0.96 }}
                        key={methods.current.id}
                        transition={{ duration: 0.3 }}
                     >
                        {methods.switch({
                           "step-basic-info": () => (
                              <BasicInfoStep form={form} />
                           ),
                           "step-purpose": () => <PurposeStep form={form} />,
                           "step-review": () => <ReviewStep form={form} />,
                        })}
                     </motion.div>
                  </AnimatePresence>
               </Stepper.Panel>
               <Stepper.Controls
                  className="flex justify-between gap-4"
                  id="navigation-controls"
               >
                  <div>
                     {!methods.isFirst && (
                        <Button
                           className="gap-4"
                           onClick={methods.prev}
                           type="button"
                           variant="outline"
                        >
                           <ChevronLeft className="w-5 h-5" />
                           {translate("pages.agent-creation-form.actions.back")}
                        </Button>
                     )}
                  </div>
                  <div>
                     {methods.switch({
                        "step-basic-info": () => (
                           <BasicInfoStepSubscribe
                              form={form}
                              next={methods.next}
                           />
                        ),
                        "step-purpose": () => (
                           <PurposeStepSubscribe
                              form={form}
                              next={methods.next}
                           />
                        ),
                        "step-review": () => (
                           <ReviewStepSubscribe form={form} mode={mode} />
                        ),
                     })}
                  </div>
               </Stepper.Controls>
            </form>
         )}
      </Stepper.Provider>
   );
}
