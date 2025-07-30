"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isOTPSent, setIsOTPSent] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Hydrate phone/email after the router is ready
  useEffect(() => {
    const p = searchParams.get("phone");
    const e = searchParams.get("email");
    if (p) setPhone(p);
    if (e) setEmail(e);
  }, [searchParams]);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/send-phone-otp", { phone });
      toast.success(res.data.message);
      setIsOTPSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/verify-phone-otp", { email, phone, code });
      toast.success(res.data.message);
      router.replace("/sign-in");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-[95%] max-w-md py-8 px-6 md:p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center">Verify your Phone</h2>
        <p className="text-center">Phone: +{phone || "loading..."}</p>

        {!isOTPSent ? (
          <Button className="w-full" onClick={handleSendOTP} disabled={loading}>
            {loading ? "Sending OTP..." : "Get OTP"}
          </Button>
        ) : (
          <>
            <Input
              placeholder="Enter OTP"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button className="w-full" onClick={handleVerifyOTP} disabled={loading}>
              {loading ? "Verifying..." : "Submit"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
