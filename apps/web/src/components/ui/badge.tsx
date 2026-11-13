import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium select-none " +
  "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0369a1] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#0369a1] text-white shadow-none",
        secondary:
          "border-[#bae6fd] bg-[#e0f2fe] text-[#075985]",
        outline:
          "border-[#bae6fd] bg-white text-[#0f2a43]",
        civic:
          "border-[#bae6fd]/80 bg-[#f0f9ff] text-[#0369a1] font-semibold",
        success:
          "border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]",
        warning:
          "border-[#fde68a] bg-[#fffbeb] text-[#92400e]",
        destructive:
          "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
