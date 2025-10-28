import { translate } from "@packages/localization";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@packages/ui/components/card";
import { LanguageToggler } from "@/layout/language-toggler";
import { ThemeToggler } from "@/layout/theme-provider";
import { WorkflowPreferences } from "./workflow-preferences";

export function PreferencesSection() {
   return (
      <div className="space-y-6">
         <Card>
            <CardHeader>
               <CardTitle>
                  {translate("pages.profile.preferences.title")}
               </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
               <ThemeToggler />
               <LanguageToggler />
            </CardContent>
         </Card>
         <WorkflowPreferences />
      </div>
   );
}
