import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-sm active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-sky-500 text-white hover:bg-sky-600 shadow-sky-500/20 hover:shadow-sky-500/35 hover:shadow-md",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20",
        outline:
          "border border-sky-200 bg-white/80 text-sky-900 hover:bg-sky-50/80 hover:border-sky-300",
        secondary:
          "bg-sky-100 text-sky-800 hover:bg-sky-200/80",
        ghost:
          "hover:bg-sky-100/70 text-slate-700 hover:text-sky-900 shadow-none",
        link: "text-sky-600 underline-offset-4 hover:underline shadow-none",
        gradient:
          "bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600 shadow-md shadow-sky-500/25",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base font-semibold",
        icon: "h-10 w-10 p-0",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

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
