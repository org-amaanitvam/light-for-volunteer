import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold select-none cursor-pointer " +
  "transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
  "active:scale-[0.98] active:translate-y-0 disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-[#0369a1] text-white shadow-[0_1px_2px_rgba(3,105,161,0.2)] hover:bg-[#075985] hover:shadow-[0_2px_6px_rgba(3,105,161,0.3)] hover:-translate-y-px active:bg-[#0c4a6e]",
        secondary:
          "bg-[#e0f2fe] text-[#075985] border border-[#bae6fd]/70 shadow-none hover:bg-[#bae6fd] hover:text-[#0c4a6e] hover:-translate-y-px active:bg-[#93c5fd]",
        outline:
          "border border-[#bae6fd] bg-white text-[#0f2a43] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-[#f4f9ff] hover:border-[#7dd3fc] hover:text-[#0369a1] hover:-translate-y-px active:bg-[#e0f2fe]",
        ghost:
          "text-[#335577] shadow-none hover:bg-[#e0f2fe]/70 hover:text-[#0369a1] active:bg-[#bae6fd]/60",
        destructive:
          "bg-[#b91c1c] text-white shadow-[0_1px_2px_rgba(185,28,28,0.2)] hover:bg-[#991b1b] hover:shadow-[0_2px_6px_rgba(185,28,28,0.3)] hover:-translate-y-px active:bg-[#7f1d1d]",
        link:
          "text-[#0369a1] underline-offset-4 hover:underline hover:text-[#075985] shadow-none p-0 h-auto active:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 rounded-lg px-3 text-xs tracking-tight",
        lg: "h-12 rounded-xl px-6 text-base tracking-tight",
        icon: "h-10 w-10 p-0 rounded-xl",
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
