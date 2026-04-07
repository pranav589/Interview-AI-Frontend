import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof Button>;

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(
  (
    {
      isLoading = false,
      loadingText,
      children,
      disabled,
      icon,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn("gap-2", className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText || "Loading..."}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </Button>
    );
  },
);

LoadingButton.displayName = "LoadingButton";
