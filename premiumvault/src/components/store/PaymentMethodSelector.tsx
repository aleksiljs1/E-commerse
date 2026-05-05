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
          className={`p-4 rounded-lg border text-sm font-semibold transition-all ${
            selected === method
              ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/10 text-white"
              : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
          }`}
        >
          {method === "PAYPAL" ? "PayPal F&F" : "Stripe"}
        </button>
      ))}
    </div>
  );
}
