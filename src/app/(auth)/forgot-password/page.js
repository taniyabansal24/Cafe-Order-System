// app/(auth)/forgot-password/page.js
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Smartphone } from "lucide-react";
import Link from "next/link";
import axios from "axios";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  forgotPasswordSchema, 
  verifyPhoneSchema, 
  resetPasswordSchema 
} from "@/schemas/forgotPasswordSchema";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState('email'); // 'email', 'verify', 'reset'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const emailForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const verifyForm = useForm({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: {
      code: "",
    },
  });

  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onEmailSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/forgot-password", data);

      if (res.data.success) {
        setUserId(res.data.userId);
        setUserEmail(res.data.userEmail);
        setUserPhone(res.data.userPhone);
        setStep('verify');
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Email submit error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifySubmit = async (data) => {
    setIsSubmitting(true);
    try {
      console.log("Verifying OTP with:", { userId, code: data.code });
      
      const res = await axios.post("/api/verify-reset-otp", {
        userId: userId,
        code: data.code
      });

      if (res.data.success) {
        setStep('reset');
        toast.success("Phone verified successfully!");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Verify OTP error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/reset-password", {
        userId: userId,
        password: data.password
      });

      if (res.data.success) {
        toast.success("Password reset successfully! You can now sign in.");
        router.push("/sign-in");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Reset password error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    try {
      const res = await axios.post("/api/resend-reset-otp", { userId });
      if (res.data.success) {
        toast.success("New OTP sent to your phone!");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Resend OTP error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
      <div className="w-[95%] max-w-md py-8 px-6 md:p-8 space-y-8 bg-white rounded-lg shadow-md my-2 md:my-6 border border-gray-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/sign-in" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sign In
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {step === 'email' ? 'Forgot Password' : 
             step === 'verify' ? 'Verify Phone' : 'Reset Password'}
          </h1>
          
          <p className="text-gray-600">
            {step === 'email' 
              ? "Enter your email to receive a verification OTP on your phone" 
              : step === 'verify'
              ? `Enter the OTP sent to your phone ending with ${userPhone?.slice(-4)}`
              : `Set your new password for ${userEmail}`}
          </p>
        </div>

        {/* Step 1: Email Input */}
        {step === 'email' && (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                name="email"
                control={emailForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your registered email"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send Phone OTP"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/sign-in" className="underline text-primary hover:text-primary/80">
                  Sign in
                </Link>
              </p>
            </form>
          </Form>
        )}

        {/* Step 2: Phone Verification */}
        {step === 'verify' && (
          <Form {...verifyForm}>
            <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  OTP sent to phone ending with {userPhone?.slice(-4)}
                </span>
              </div>

              <FormField
                name="code"
                control={verifyForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                        }}
                        disabled={isSubmitting}
                        className="text-center text-2xl tracking-widest"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Phone"
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resendOtp}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  Resend OTP
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep('email')}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  Back to Email
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Step 3: Reset Password */}
        {step === 'reset' && (
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <FormField
                name="password"
                control={resetForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="confirmPassword"
                control={resetForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep('verify')}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  Back to Verification
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}