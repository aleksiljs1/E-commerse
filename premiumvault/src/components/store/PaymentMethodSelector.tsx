"use client";

type Props = {
  selected: "STRIPE" | "PAYPAL" | null;
  onSelect: (method: "STRIPE" | "PAYPAL") => void;
};

export function PaymentMethodSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(["PAYPAL", "STRIPE"] as const).map((method) => (
        <button
          key={method}
          type="button"
          onClick={() => onSelect(method)}
          className={`cursor-pointer p-4 rounded-lg border text-sm font-semibold transition-all ${
            selected === method
              ? "ring-2 ring-orange-400 border-orange-400 bg-orange-400/10 text-rose-400"
              : "border-white/[0.1] bg-white/[0.04] text-gray-400 hover:border-white/[0.2]"
          }`}
        >
          {method === "PAYPAL" ? "PayPal F&F" : "Stripe"}
        </button>
      ))}
    </div>
  );
}
