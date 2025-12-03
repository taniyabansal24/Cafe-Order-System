// app/(auth)/verify/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import axios from "axios";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const registrationId = searchParams.get("registrationId");

  const [step, setStep] = useState('email'); // 'email' or 'phone'
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!email || !phone || !registrationId) {
      toast.error("Invalid verification session. Please sign up again.");
      router.push("/sign-up");
      return;
    }
    setIsLoading(false);
  }, [email, phone, registrationId, router]);

  const verifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/verify-code", {
        email: email,
        code: emailOtp
      });

      if (res.data.success) {
        setStep('phone');
        setEmailOtp('');
        toast.success("Email verified successfully! Phone OTP sent.");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Email verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

// In your verify page - phone verification section
const verifyPhoneOtp = async () => {
  if (!phoneOtp || phoneOtp.length !== 6) {
    toast.error("Please enter a valid 6-digit OTP");
    return;
  }

  setIsSubmitting(true);
  try {
    const res = await axios.post("/api/verify-phone-otp", {
      registrationId: registrationId,
      code: phoneOtp
    });

    if (res.data.success) {
      toast.success("Registration completed successfully! You can now sign in.");
      router.push("/sign-in");
    } else {
      toast.error(res.data.message || "Invalid OTP");
    }
  } catch (err) {
    console.error("Phone OTP error:", err.response?.data);
    
    // Handle different error types
    if (err.response?.status === 400) {
      const errorMsg = err.response.data.message;
      
      if (errorMsg.includes('session expired') || errorMsg.includes('not found')) {
        toast.error("Session expired. Please sign up again.");
        router.push("/sign-up");
      } else if (errorMsg.includes('Invalid OTP')) {
        toast.error("Invalid OTP. Please check the code and try again.");
        setPhoneOtp(''); // Clear for retry
      } else {
        toast.error(errorMsg);
      }
    } else {
      toast.error("Phone verification failed. Please try again.");
    }
  } finally {
    setIsSubmitting(false);
  }
};

const resendPhoneOtp = async () => {
  try {
    const res = await axios.post("/api/send-phone-otp", { 
      registrationId: registrationId 
    });

    if (res.data.success) {
      toast.success("New OTP sent successfully!");
    } else {
      toast.error(res.data.message || "Failed to resend OTP");
    }
  } catch (err) {
    console.error("Resend OTP error:", err.response?.data);
    
    if (err.response?.status === 400) {
      const errorMsg = err.response.data.message;
      
      if (errorMsg.includes('not found') || errorMsg.includes('expired')) {
        toast.error("Session expired. Please sign up again.");
        router.push("/sign-up");
      } else {
        toast.error(errorMsg);
      }
    } else {
      toast.error("Failed to resend OTP. Please try again.");
    }
  }
};

  const resendEmailOtp = async () => {
    try {
      // You might want to create a separate endpoint for resending email OTP
      // For now, we'll show a message
      toast.info("Please sign up again to get a new email OTP");
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
      <div className="w-[95%] max-w-md py-8 px-6 md:p-8 space-y-8 bg-white rounded-lg shadow-md my-2 md:my-6 border border-gray-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'email' ? 'Verify Your Email' : 'Verify Your Phone'}
          </h1>
          <p className="text-gray-600 mb-6">
            {step === 'email' 
              ? `We've sent a 6-digit verification code to your email: ${email}`
              : `We've sent a 6-digit verification code to your phone: ${phone}`
            }
          </p>
        </div>

        {step === 'email' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />
              
              <Button 
                onClick={verifyEmailOtp} 
                disabled={isSubmitting || emailOtp.length !== 6}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Email...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={resendEmailOtp}
                className="w-full"
              >
                Resend Email OTP
              </Button>
            </div>
          </div>
        )}

        {step === 'phone' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />
              
              <Button 
                onClick={verifyPhoneOtp} 
                disabled={isSubmitting || phoneOtp.length !== 6}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Phone...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={resendPhoneOtp}
                className="w-full"
              >
                Resend Phone OTP
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => setStep('email')}
                className="w-full"
              >
                Back to Email Verification
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}