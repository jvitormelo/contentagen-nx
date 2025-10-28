import { Button } from "@packages/ui/components/button";
import type * as React from "react";

export interface SquaredIconButtonProps extends React.ComponentProps<"button"> {
   children: React.ReactNode;
   destructive?: boolean;
}

export function SquaredIconButton({
   children,
   destructive = false,
   className = "",
   ...props
}: SquaredIconButtonProps) {
   return (
      <Button
         className={
            "w-full h-full flex flex-col items-center justify-center p-2 py-8 text-center cursor-pointer border-dashed" +
            (destructive ? "border-primary/10 " : "") +
            className
         }
         variant={"outline"}
         {...props}
      >
         {children}
      </Button>
   );
}
