import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@packages/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card";
import { SquaredIconButton } from "@packages/ui/components/squared-icon-button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Settings, HelpCircle } from "lucide-react";
import mascot from "@packages/brand/logo.svg";

export function AgentCreationFlowPage() {
  // Move DriverJS step definition directly into startTutorial
  const startTutorial = () => {
    const driverObj = driver({
      allowClose: true,
      doneBtnText: "Let's start! 🚀",
      nextBtnText: "Next →",
      popoverClass: "driverjs-theme-custom",
      prevBtnText: "← Previous",
      showButtons: ["next", "previous", "close"],
      showProgress: true,
      steps: [
        {
          element: "#mascot-speech",
          popover: {
            align: "start" as const,
            description: `<div style="display:flex;align-items:center;margin-bottom:8px;"><img src="${mascot}" alt="Mascot" style="height:24px;margin-right:6px;border-radius:50%;"/>Welcome!</div>I'm here to help you choose the best way to create your content agent. Let me show you around!`,
            side: "bottom" as const,
            title: "🤖 Your Personal Assistant",
          },
        },
        {
          element: "#manual-card",
          popover: {
            description:
              "Choose this option for full control: define tone of voice, audience persona, preferred topics, SEO keywords, and formatting style. Ideal for advanced users or those with specific requirements.",
            title: "Custom Agent Builder",
          },
        },
      ],
    });
    driverObj.drive();
  };

  return (
    <div className="h-full w-full flex flex-col space-y-8">
      

      {/* Mascot Speech Bubble */}
      <div className="flex items-start gap-4 w-full" id="mascot-speech">
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              alt="Content Agent Mascot"
              className="w-10 h-10 rounded-full shadow-lg border-white border-2"
              src={mascot}
            />
            <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-green-400 border-2 border-white">
              <span className="w-1 h-1 rounded-full bg-white" />
            </span>
          </div>
        </div>
        <div className="relative flex-1 px-4 py-2 bg-white rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 ease-in-out">
          <span className="absolute left-[-8px] top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-12 border-r-white" />
          <span className="block text-slate-800 font-medium leading-relaxed transition-all duration-300">
            Welcome! Let's create your perfect content agent. Choose how you'd like to set it up below.
          </span>
          <Button
            className="mt-2 h-auto text-xs text-slate-600 hover:bg-slate-50 px-2 py-1 transition-colors duration-200 rounded-full"
            onClick={startTutorial}
            size="sm"
            type="button"
            variant="ghost"
          >
            💡 Get help choosing
          </Button>
        </div>
      </div>

      {/* Agent Creation Option Card */}
      <Link  to="/agents/manual">
              
                <SquaredIconButton  id="manual-card" >
 <Settings className="h-10 w-10 text-slate-600 transition-all duration-300 group-hover:text-white" />
     Custom Agent Builder
                </SquaredIconButton>
               
             
            </Link>
    </div>
  );
}
