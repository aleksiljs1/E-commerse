"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] text-white">
      <h1 className="mb-4 text-4xl font-bold">Something went wrong</h1>
      <p className="mb-8 text-gray-400">An unexpected error occurred.</p>
      <button
        onClick={reset}
        className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
      >
        Try again
      </button>
    </div>
  );
}
