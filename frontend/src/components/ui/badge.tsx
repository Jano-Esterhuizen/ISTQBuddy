import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        navy: "bg-brand-navy text-white",
        k1: "bg-brand-green-soft text-brand-green",
        k2: "bg-brand-amber-soft text-brand-amber",
        k3: "bg-brand-red-soft text-brand-red",
        green: "bg-brand-green-soft text-brand-green",
        red: "bg-brand-red-soft text-brand-red",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
