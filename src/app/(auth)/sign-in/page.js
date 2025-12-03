"use client";

import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { gsap } from "gsap";

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

import { signInSchema } from "@/schemas/signInSchema";

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Initial state - logo starts from center with scale 0
    gsap.set(logoRef.current, {
      position: "absolute",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      scale: 0,
      rotation: -180,
      opacity: 0,
    });

    gsap.set(textRef.current, {
      position: "absolute",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      scale: 0.8,
    });

    // Animation sequence with more dramatic effects
    tl.to(logoRef.current, {
      opacity: 1,
      scale: 1.5,
      rotation: 0,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    })
      .to(logoRef.current, {
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      })
      .to(logoRef.current, {
        left: "0%",
        xPercent: 0,
        duration: 1,
        ease: "power2.inOut",
      })
      .fromTo(
        textRef.current,
        {
          opacity: 0,
          scale: 0.8,
        },
        {
          opacity: 1,
          scale: 1,
          left: "60px",
          xPercent: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.6"
      );

    return () => {
      tl.kill();
    };
  }, []);

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        toast.error(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("SignIn error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
      <div className="w-[95%] max-w-xl py-8 px-6 md:p-8 space-y-8 bg-card rounded-lg shadow-md my-2 md:my-6 border">
        <div className="text-center relative h-20 mb-6">
          {" "}
          {/* Added relative positioning and fixed height */}
          {/* Logo Container */}
          <div
            ref={logoRef}
            className="flex aspect-square size-12 items-center justify-center rounded-4xl border-2 border-gray-800 bg-gray-100 shadow-md absolute"
          >
            <img
              src="/assets/logo.png"
              alt="Cafe Order Logo"
              className="size-8"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div className="hidden size-8 items-center justify-center text-foreground font-bold text-lg">
              ☕
            </div>

            {/* Text Container */}

            <h1
              ref={textRef}
              className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground leading-tight w-max"
            >
              Cafe Order System
            </h1>
          </div>
        </div>
        <p className="mb-4 text-muted-foreground text-center">Sign in to continue</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email field */}
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password field */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-sm mt-2 text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="underline text-primary hover:text-primary/80"
              >
                Sign up
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}