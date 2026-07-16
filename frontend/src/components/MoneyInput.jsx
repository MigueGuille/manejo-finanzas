import { formatDecimal, parseDecimalInput } from "../utils/formatters.js";

export const MoneyInput = ({ value, onChange, currency = "USD", ...props }) => {
  const handleChange = (event) => {
    onChange(parseDecimalInput(event.target.value));
  };

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-2.5 text-sm font-bold text-slate-400">{currency === "VES" || currency === "BS" ? "Bs" : "$"}</span>
      <input
        {...props}
        className={`field pl-10 text-right text-base font-bold tabular-nums ${props.className || ""}`}
        inputMode="numeric"
        autoComplete="off"
        value={formatDecimal(value)}
        onChange={handleChange}
      />
    </div>
  );
};
