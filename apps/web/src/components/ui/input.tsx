import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#e5e7eb] bg-white px-3.5 py-2 " +
          "text-base sm:text-sm text-[#1f2d35] placeholder:text-[#607b85] " +
          "transition-[border-color,box-shadow] duration-150 " +
          "hover:border-[#26505c]/40 " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26505c] focus-visible:border-[#26505c] focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#edf3f4] " +
          "shadow-[0_1px_2px_rgba(31,45,53,0.03)]",
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
