"use client";

type Props = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
};

export function QuantityControl({ value, onIncrement, onDecrement, min = 1, max = 99 }: Props) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onDecrement}
        disabled={value <= min}
        className="cursor-pointer w-8 h-8 rounded-md border border-white/[0.1] bg-white/[0.04] text-white flex items-center justify-center hover:bg-white/[0.1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        type="button"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium text-white">{value}</span>
      <button
        onClick={onIncrement}
        disabled={value >= max}
        className="cursor-pointer w-8 h-8 rounded-md border border-white/[0.1] bg-white/[0.04] text-white flex items-center justify-center hover:bg-white/[0.1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        type="button"
      >
        +
      </button>
    </div>
  );
}
