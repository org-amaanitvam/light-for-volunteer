import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold select-none cursor-pointer " +
  "transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26505c] focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
  "active:scale-[0.97] active:translate-y-0 disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-[#26505c] text-white shadow-[0_1px_3px_rgba(38,80,92,0.25)] hover:bg-[#1e3f49] hover:shadow-[0_4px_12px_rgba(38,80,92,0.3)] hover:-translate-y-px active:bg-[#163139]",
        secondary:
          "bg-[#ffe970] text-[#26505c] font-bold shadow-[0_2px_8px_rgba(255,233,112,0.4)] hover:bg-[#f3b61f] hover:text-[#1f2d35] hover:shadow-[0_4px_14px_rgba(243,182,31,0.4)] hover:-translate-y-px active:bg-[#e2a514]",
        outline:
          "border border-[#e5e7eb] bg-white text-[#26505c] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-[#edf3f4] hover:border-[#26505c]/40 hover:-translate-y-px active:bg-[#e2ebec]",
        ghost:
          "text-[#26505c] shadow-none hover:bg-[#edf3f4] active:bg-[#e2ebec]",
        destructive:
          "bg-[#d64545] text-white shadow-[0_1px_2px_rgba(214,69,69,0.2)] hover:bg-[#b83535] hover:shadow-[0_2px_6px_rgba(214,69,69,0.3)] hover:-translate-y-px active:bg-[#9c2727]",
        link:
          "text-[#26505c] underline-offset-4 hover:underline hover:text-[#1e3f49] shadow-none p-0 h-auto active:scale-100",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm",
        sm: "h-9 rounded-xl px-3.5 text-xs tracking-tight",
        lg: "h-13 rounded-2xl px-7 text-base font-bold tracking-tight",
        icon: "h-11 w-11 p-0 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
