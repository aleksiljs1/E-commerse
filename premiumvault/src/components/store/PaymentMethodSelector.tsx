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
              ? "ring-2 ring-[#1F8A5B] border-[#1F8A5B] bg-[#1F8A5B]/10 text-[#6ED3A3]"
              : "border-[#1F8A5B]/30 bg-[#16221B] text-[#A0B5A8] hover:border-[#1F8A5B]/60"
          }`}
        >
          {method === "PAYPAL" ? "PayPal F&F" : "Stripe"}
        </button>
      ))}
    </div>
  );
}
