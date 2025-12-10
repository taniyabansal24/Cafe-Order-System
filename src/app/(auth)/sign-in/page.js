// src/app/sign-in/page.js
"use client";

import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Coffee, ArrowRight, Shield, Smartphone, Users } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { signInSchema } from "@/schemas/signInSchema";

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Initial state - elements start hidden
    gsap.set(".animate-in", {
      opacity: 0,
      y: 20
    });

    gsap.set(logoRef.current, {
      scale: 0,
      rotation: -180,
      opacity: 0,
    });

    gsap.set(textRef.current, {
      opacity: 0,
      scale: 0.8,
    });

    // Logo animation
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
      .to(
        textRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.6"
      )
      .to(".animate-in", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      });

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Coffee className="h-6 w-6 text-white dark:invert" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                CafeFlow
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden sm:inline text-muted-foreground">New to CafeFlow?</span>
              <Link href="/sign-up">
                <Button variant="outline">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container md:mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-13 items-start ">
          {/* Left Side - Form */}
          <div className="max-w-2xl mx-auto lg:mx-0">
            <div className="text-center lg:text-left mb-8">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div
                  ref={logoRef}
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary"
                >
                  <Coffee className="h-7 w-7 text-white dark:invert" />
                </div>
                <h1
                  ref={textRef}
                  className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                >
                  CafeFlow
                </h1>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 animate-in">
                Welcome Back
              </h2>
              <p className="text-lg text-muted-foreground mb-2 animate-in">
                Sign in to access your cafe dashboard
              </p>
              <Badge className="animate-in" variant="outline">
                <Shield className="h-3 w-3 mr-1" />
                Secure login with end-to-end encryption
              </Badge>
            </div>

            <Card className="border-2 animate-in">
              <CardHeader>
                <CardTitle className="text-2xl">Sign in to your account</CardTitle>
                <CardDescription>
                  Enter your credentials to access the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                              placeholder="cafe@example.com"
                              {...field}
                              disabled={isSubmitting}
                              className="h-12"
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
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-foreground">Password</FormLabel>
                            <Link
                              href="/forgot-password"
                              className="text-sm text-primary hover:text-primary/80 underline"
                            >
                              Forgot password?
                            </Link>
                          </div>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              disabled={isSubmitting}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                       Don&apos;t have an account?
                        <Link
                          href="/sign-up"
                          className="font-semibold text-primary hover:text-primary/80 underline"
                        >
                          Sign up for free
                        </Link>
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-8 animate-in">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 px-4 py-1 text-sm font-semibold bg-gradient-to-r from-primary to-purple-600">
                <Smartphone className="h-3 w-3 mr-1" />
                TRUSTED BY 500+ CAFES
              </Badge>
              <h3 className="text-3xl font-bold mb-6">
                Everything you need to manage your cafe
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="p-3 rounded-lg w-fit mb-3 bg-green-500/10">
                    <Smartphone className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle>Real-time Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track orders live from any device. Get instant notifications for new orders.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="p-3 rounded-lg w-fit mb-3 bg-blue-500/10">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>Customer Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Understand customer behavior with detailed analytics and feedback.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="p-3 rounded-lg w-fit mb-3 bg-purple-500/10">
                    <Shield className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle>Secure & Reliable</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Bank-level security for all transactions and customer data.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="p-3 rounded-lg w-fit mb-3 bg-amber-500/10">
                    <Coffee className="h-6 w-6 text-amber-500" />
                  </div>
                  <CardTitle>Menu Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Easily update your menu, prices, and special offers in real-time.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Testimonial */}
            <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Coffee className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg italic mb-4">
                      &quot;CafeFlow transformed our operations. We&apos;ve seen a 40% increase in efficiency since we started using it.&quot;
                    </p>
                    <div>
                      <p className="font-semibold">Rahul Sharma</p>
                      <p className="text-sm text-muted-foreground">Owner, Urban Brew Cafe</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t pt-8 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Coffee className="h-6 w-6 text-white dark:invert" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  CafeFlow
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Revolutionizing cafe management since 2024
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
            <p>
              © 2024 CafeFlow. All rights reserved. Built with ❤️ for cafe owners worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
