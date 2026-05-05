"use client";
import { Button } from "@/components/ui/button";

type CredentialEntry = {
  orderItemId: string;
  serviceType: string;
  username: string;
  password: string;
};

type ExpandedItem = {
  id: string;
  product: { title: string; serviceType: string };
  instanceLabel: string;
};

type Props = {
  credentials: CredentialEntry[];
  expandedItems: ExpandedItem[];
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
};

export function ReviewScreen({ credentials, expandedItems, onConfirm, onBack, isSubmitting }: Props) {
  return (
    <div className="min-h-screen bg-[#0F1412] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Review Your Credentials</h2>
          <p className="text-[#A0B5A8] text-sm mt-2">
            Please review your credentials below before accepting.
          </p>
          <p className="text-[#A0B5A8]/70 text-xs mt-1">
            Make sure all details are correct — once submitted, you cannot change them.
          </p>
        </div>
        <div className="bg-[#16221B] border border-[#1F8A5B]/30 rounded-2xl divide-y divide-[#1F8A5B]/20">
          {credentials.map((cred, i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-[#E8F5EE]">
                  {expandedItems[i]?.product.title}{expandedItems[i]?.instanceLabel}
                </p>
                <p className="text-xs text-[#A0B5A8] mt-0.5">Username: {cred.username}</p>
              </div>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                Ready
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-[#1F8A5B]/30"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Go Back
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:brightness-110"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Accept & Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
