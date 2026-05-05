type Props = { orderNumber: string };

export function CredentialSuccess({ orderNumber }: Props) {
  return (
    <div className="min-h-screen bg-[#0F1412] text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold text-[#E8F5EE]">Congratulations!</h1>
        <p className="text-[#A0B5A8] text-lg leading-relaxed">
          Your credentials have been received for order{" "}
          <span className="font-mono text-[#E8F5EE]">{orderNumber}</span>.
        </p>
        <div className="bg-[#16221B] border border-[#1F8A5B]/30 rounded-xl p-4">
          <p className="text-[#6ED3A3] font-semibold">✅ Submission successful</p>
          <p className="text-[#A0B5A8] text-sm mt-1">
            Your account will be upgraded within{" "}
            <strong className="text-[#E8F5EE]">4–5 business days</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
