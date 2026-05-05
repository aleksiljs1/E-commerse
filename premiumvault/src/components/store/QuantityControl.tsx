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
        className="w-8 h-8 rounded-md border border-zinc-700 bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        type="button"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium text-white">{value}</span>
      <button
        onClick={onIncrement}
        disabled={value >= max}
        className="w-8 h-8 rounded-md border border-zinc-700 bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        type="button"
      >
        +
      </button>
    </div>
  );
}
