"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { ServiceIcon } from "@/components/store/ServiceIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReviewScreen } from "@/components/credentials/CredentialStepper";
import { CredentialSuccess } from "@/components/credentials/CredentialSuccess";

type OrderItem = {
  id: string;
  quantity: number;
  product: { id: string; title: string; serviceType: string; logoUrl: string | null };
};

type CredentialEntry = {
  orderItemId: string;
  serviceType: string;
  username: string;
  password: string;
};

const credentialSchema = z
  .object({
    username: z.string().min(1, "Required"),
    password: z.string().min(1, "Required"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CredentialFormData = z.infer<typeof credentialSchema>;

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-zinc-700 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-zinc-400 text-sm">Loading your order...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-5xl">&#x26A0;&#xFE0F;</div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-zinc-400">{message}</p>
        <Button
          variant="outline"
          className="border-zinc-700"
          onClick={() => (window.location.href = "/")}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}

function SubmitCredentialsContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [collectedCredentials, setCollectedCredentials] = useState<CredentialEntry[]>([]);
  const [stage, setStage] = useState<"loading" | "error" | "filling" | "review" | "success">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CredentialFormData>({
    resolver: zodResolver(credentialSchema),
  });

  // Expand items by quantity — e.g. 2× Spotify = 2 separate entries
  const expandedItems = items.flatMap((item) =>
    Array.from({ length: item.quantity }, (_, i) => ({
      ...item,
      instanceLabel: item.quantity > 1 ? ` (${i + 1} of ${item.quantity})` : "",
      uniqueKey: `${item.id}-${i}`,
    }))
  );

  useEffect(() => {
    if (!token) {
      setStage("error");
      setErrorMessage("No token provided.");
      return;
    }
    api
      .get(`/api/credentials/${token}`)
      .then((res) => {
        setOrderNumber(res.data.orderNumber);
        setItems(res.data.items);
        setStage("filling");
      })
      .catch((err) => {
        setStage("error");
        setErrorMessage(err.response?.data?.error ?? "Invalid or expired link.");
      });
  }, [token]);

  const onCredentialSubmit = (data: CredentialFormData) => {
    const item = expandedItems[currentItemIndex];
    setCollectedCredentials((prev) => [
      ...prev,
      {
        orderItemId: item.id,
        serviceType: item.product.serviceType,
        username: data.username,
        password: data.password,
      },
    ]);
    reset();
    if (currentItemIndex + 1 < expandedItems.length) {
      setCurrentItemIndex((i) => i + 1);
    } else {
      setStage("review");
    }
  };

  const onFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/api/credentials", { token, credentials: collectedCredentials });
      setStage("success");
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBack = () => {
    setCollectedCredentials([]);
    setCurrentItemIndex(0);
    setStage("filling");
  };

  if (stage === "loading") return <LoadingScreen />;
  if (stage === "error") return <ErrorScreen message={errorMessage} />;
  if (stage === "success") return <CredentialSuccess orderNumber={orderNumber ?? ""} />;
  if (stage === "review") {
    return (
      <ReviewScreen
        credentials={collectedCredentials}
        expandedItems={expandedItems}
        onConfirm={onFinalSubmit}
        onBack={onBack}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Filling stage — show one item at a time
  const currentItem = expandedItems[currentItemIndex];
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress */}
        <p className="text-sm text-zinc-500 text-center mb-6">
          Step {currentItemIndex + 1} of {expandedItems.length}
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {/* Service icon + title */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <ServiceIcon
              serviceType={currentItem.product.serviceType}
              logoUrl={currentItem.product.logoUrl}
              size="lg"
            />
            <h2 className="text-xl font-bold text-center">
              {currentItem.product.title}{currentItem.instanceLabel}
            </h2>
            <p className="text-sm text-zinc-400 text-center">
              Enter the account credentials you want us to upgrade.
            </p>
          </div>

          <form onSubmit={handleSubmit(onCredentialSubmit)} className="space-y-4">
            <div>
              <Label>Email / Username</Label>
              <Input
                placeholder="your@email.com or username"
                className="bg-zinc-800 border-zinc-700 mt-1"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-700 mt-1"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-700 mt-1"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2">
              {currentItemIndex + 1 < expandedItems.length ? "Next →" : "Review & Accept"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SubmitCredentialsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SubmitCredentialsContent />
    </Suspense>
  );
}
