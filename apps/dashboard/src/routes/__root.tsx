import brandConfig from "@packages/brand/index.json";
import { PostHogWrapper } from "@packages/posthog/client";
import { Toaster } from "@packages/ui/components/sonner";
import appCss from "@packages/ui/globals.css?url";
import { useMutation } from "@tanstack/react-query";
import {
   createRootRouteWithContext,
   HeadContent,
   Outlet,
   redirect,
   Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ErrorModalProvider } from "@/features/error-modal/lib/error-modal-context";
import { ErrorModal } from "@/features/error-modal/ui/error-modal";
import { useTRPC } from "@/integrations/clients";
import { ThemeProvider } from "@/layout/theme-provider";
import type { RouterContext } from "../router";
import "@packages/localization";
import i18n from "@packages/localization";
import { NotFoundComponent } from "@/default/not-found";
export const Route = createRootRouteWithContext<RouterContext>()({
   component: RootComponent,

   head: () => ({
      links: [
         {
            href: appCss,
            rel: "stylesheet",
         },
         { href: "/favicon.svg", rel: "icon" },
      ],
      meta: [
         {
            title: `${brandConfig.name} - ${brandConfig.catch}`,
         },
         {
            charSet: "UTF-8",
         },
         {
            content: "width=device-width, initial-scale=1.0",
            name: "viewport",
         },
         {
            content: i18n.language,
            name: "language",
         },
      ],
      scripts: [
         ...(!import.meta.env.PROD
            ? [
                 {
                    children: `import RefreshRuntime from "/@react-refresh"
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true`,
                    type: "module",
                 },
                 {
                    src: "/@vite/client",
                    type: "module",
                 },
              ]
            : []),
         {
            src: import.meta.env.PROD
               ? "/assets/entry-client.js"
               : "/src/entry-client.tsx",
            type: "module",
         },
      ],
   }),
   loader: async ({ location }) => {
      if (location.href === "/") {
         throw redirect({ to: "/auth/sign-in" });
      }
   },
   notFoundComponent: () => (
      <div className="h-screen w-screen">
         <NotFoundComponent />
      </div>
   ),
   ssr: true,
   wrapInSuspense: true,
});

function RootComponent() {
   return (
      <html lang={i18n.language}>
         <head>
            <HeadContent />
         </head>
         <body>
            <PostHogWrapper>
               <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
               >
                  <ErrorModalProvider>
                     <ErrorModalWithMutation />
                     <Toaster />
                     <Outlet /> {/* Start rendering router matches */}
                     <TanStackRouterDevtools position="bottom-left" />
                  </ErrorModalProvider>
               </ThemeProvider>
            </PostHogWrapper>
            <Scripts />
         </body>
      </html>
   );
}

function ErrorModalWithMutation() {
   const trpc = useTRPC();
   const submitBugReport = useMutation(
      trpc.bugReport.submitBugReport.mutationOptions(),
   );

   return <ErrorModal submitBugReport={submitBugReport} />;
}
