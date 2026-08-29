import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap select-none disabled:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "metal",
        secondary: "glass",
        ghost:
          "border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-foreground active:translate-y-px",
        danger:
          "glass text-destructive-foreground [&]:bg-destructive/80 hover:[&]:bg-destructive",
      },
      size: {
        sm: "h-11 rounded-[7px] px-4 text-[13px]",
        md: "h-12 rounded-[7px] px-5",
        lg: "h-12 rounded-[7px] px-7 text-[15px]",
        icon: "h-11 w-11 rounded-[7px]",
      },

      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

export type GlassButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof glassButtonVariants> & { asChild?: boolean };

export function GlassButton({
  className,
  variant,
  size,
  block,
  asChild,
  ...props
}: GlassButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(glassButtonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}
