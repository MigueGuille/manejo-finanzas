import { forwardRef } from "react";
import { CalendarDays } from "lucide-react";

export const DateInput = forwardRef(({ className = "", ...props }, ref) => (
  <div className="relative">
    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
    <input
      {...props}
      ref={ref}
      type="date"
      className={`field min-h-12 appearance-none pl-11 pr-3 text-base font-semibold tabular-nums ${className}`}
    />
  </div>
));

DateInput.displayName = "DateInput";
