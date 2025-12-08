"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [registrationId, setRegistrationId] = useState("");

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Hydrate data after the router is ready
  useEffect(() => {
    const p = searchParams.get("phone");
    const e = searchParams.get("email");
    const id = searchParams.get("registrationId");

    if (!p || !e || !id) {
      toast.error("Invalid verification session. Please sign up again.");
      router.push("/sign-up");
      return;
    }

    setPhone(p);
    setEmail(e);
    setRegistrationId(id);
    setIsLoading(false);
  }, [searchParams, router]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/verify-phone-otp", {
        registrationId,
        code: otp,
      });

      if (res.data.success) {
        toast.success("Registration completed successfully! You can now sign in.");
        router.push("/sign-in");
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Phone verification failed";
      toast.error(errorMessage);

      if (err.response?.status === 400) {
        setOtp(""); // clear invalid input
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const res = await axios.post("/api/send-phone-otp", {
        registrationId,
      });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading verification page...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-800">
      <div className="w-[95%] max-w-md py-8 px-6 md:p-8 space-y-8 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Verify Your Phone</h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to your phone:
            <br />
            <strong>{phone}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
            className="text-center text-2xl tracking-widest border-2 focus:border-blue-500"
            disabled={isSubmitting}
          />

          <Button
            onClick={handleVerifyOTP}
            disabled={isSubmitting || otp.length !== 6}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Phone & Complete Registration"
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleResendOTP}
            disabled={isSubmitting}
            className="w-full"
          >
            Resend OTP
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push(`/verify?email=${email}&registrationId=${registrationId}`)}
            disabled={isSubmitting}
            className="w-full"
          >
            Back to Email Verification
          </Button>
        </div>
      </div>
    </div>
  );
}
