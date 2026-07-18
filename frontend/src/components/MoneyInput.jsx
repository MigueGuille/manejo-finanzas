import { useEffect, useState } from "react";
import { formatDecimal } from "../utils/formatters.js";

const toDigits = (value) => {
  const cents = Math.round(Number(value || 0) * 100);
  return cents > 0 ? String(cents) : "";
};

const digitsToAmount = (digits) => Number(digits || 0) / 100;

const normalizeDigits = (digits) => String(digits || "").replace(/\D/g, "").replace(/^0+(?=\d)/, "");

const selectionToEnd = (event) => {
  requestAnimationFrame(() => {
    const input = event.target;
    input.setSelectionRange(input.value.length, input.value.length);
  });
};

export const MoneyInput = ({ value, onChange, currency = "USD", ...props }) => {
  const [digits, setDigits] = useState(toDigits(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) setDigits(toDigits(value));
  }, [isFocused, value]);

  const commitDigits = (nextDigits) => {
    const normalizedDigits = normalizeDigits(nextDigits);
    setDigits(normalizedDigits);
    onChange(digitsToAmount(normalizedDigits));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      commitDigits(digits.slice(0, -1));
      selectionToEnd(event);
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      commitDigits(`${digits}${event.key}`);
      selectionToEnd(event);
      return;
    }

    if (!["Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
    }
  };

  const handleBeforeInput = (event) => {
    const inputType = event.nativeEvent.inputType;
    const data = event.nativeEvent.data || "";

    if (inputType === "deleteContentBackward" || inputType === "deleteContentForward") {
      event.preventDefault();
      commitDigits(digits.slice(0, -1));
      selectionToEnd(event);
      return;
    }

    if (inputType?.startsWith("insert") && data) {
      event.preventDefault();
      commitDigits(`${digits}${data.replace(/\D/g, "")}`);
      selectionToEnd(event);
    }
  };

  const handleChange = (event) => {
    commitDigits(event.target.value.replace(/\D/g, ""));
    selectionToEnd(event);
  };

  const handlePaste = (event) => {
    event.preventDefault();
    commitDigits(`${digits}${event.clipboardData.getData("text").replace(/\D/g, "")}`);
    selectionToEnd(event);
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    props.onBlur?.(event);
  };

  const handleFocus = (event) => {
    setIsFocused(true);
    selectionToEnd(event);
    props.onFocus?.(event);
  };

  const displayValue = formatDecimal(digitsToAmount(digits));

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">{currency === "VES" || currency === "BS" ? "Bs" : "$"}</span>
      <input
        {...props}
        className={`field min-h-12 pl-10 text-right text-base font-bold tabular-nums ${props.className || ""}`}
        inputMode="numeric"
        autoComplete="off"
        value={displayValue}
        onBeforeInput={handleBeforeInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    </div>
  );
};
