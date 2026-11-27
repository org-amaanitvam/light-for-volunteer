import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#bae6fd] bg-white px-3.5 py-2 " +
          "text-base sm:text-sm text-[#0f2a43] placeholder:text-[#6e8ba8] " +
          "transition-[border-color,box-shadow] duration-150 " +
          "hover:border-[#7dd3fc] " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] focus-visible:border-[#0369a1] focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f4f9ff] " +
          "shadow-[0_1px_2px_rgba(15,42,67,0.03)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
