type Props = { orderNumber: string };

export function CredentialSuccess({ orderNumber }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold">Congratulations!</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Your credentials have been received for order{" "}
          <span className="font-mono text-white">{orderNumber}</span>.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-green-400 font-semibold">✅ Submission successful</p>
          <p className="text-zinc-400 text-sm mt-1">
            Your account will be upgraded within{" "}
            <strong className="text-white">4–5 business days</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
