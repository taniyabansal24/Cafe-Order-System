"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Coffee, ArrowRight, CheckCircle, QrCode, Smartphone, BarChart, Users, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { State, City } from "country-state-city";

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
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { signUpSchema } from "@/schemas/signUpSchema";

export default function SignUpPage() {
  const router = useRouter();
  const logoRef = useRef(null);
  const textRef = useRef(null);

  // Animation useEffect
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
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      cafeName: "",
      address: "",
      state: "",
      city: "",
      pincode: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [states] = useState(State.getStatesOfCountry("IN"));
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState(null);

  // Form watch useEffect for pincode
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      const pincode = value.pincode;
      if (name === "pincode" && pincode?.length === 6) {
        fetch(`https://api.postalpincode.in/pincode/${pincode}`)
          .then((res) => res.json())
          .then((data) => {
            const postOffice = data?.[0]?.PostOffice?.[0];
            if (postOffice) {
              const stateName = postOffice.State;
              const cityName = postOffice.District;

              const foundState = states.find((s) => s.name === stateName);
              if (foundState) {
                form.setValue("state", foundState.name);
                setSelectedState(foundState);

                const citiesList = City.getCitiesOfState(
                  "IN",
                  foundState.isoCode
                );
                setCities(citiesList);

                const foundCity = citiesList.find((c) => c.name === cityName);
                if (foundCity) {
                  form.setValue("city", foundCity.name);
                }

                toast.success(`Location detected: ${cityName}, ${stateName}`);
              } else {
                toast.error("State not found from pincode.");
              }
            } else {
              toast.error("Invalid pincode or location not found.");
            }
          })
          .catch(() => {
            toast.error("Failed to fetch location from pincode.");
          });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, states]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      let phone = data.phone.trim();
      if (!phone.startsWith("+91")) {
        phone = `+91${phone}`;
      }
      const formattedData = { ...data, phone };

      const res = await axios.post("/api/sign-up", formattedData);

      if (res.data.success) {
        toast.success("Email OTP sent successfully!");
        // Redirect to verify page with all necessary data
        router.replace(
          `/verify?email=${encodeURIComponent(data.email)}&phone=${encodeURIComponent(formattedData.phone)}&registrationId=${res.data.registrationId}`
        );
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ComboBoxSelect = ({
    label,
    name,
    options,
    onChange,
    valueKey = "name",
  }) => (
    <FormField
      name={name}
      control={form.control}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-foreground">{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between text-left h-12"
                >
                  {field.value || `Select ${label}`}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder={`Search ${label}...`} />
                <CommandList>
                  {options.map((item) => (
                    <CommandItem
                      key={item[valueKey]}
                      value={item[valueKey]}
                      onSelect={() => {
                        field.onChange(item[valueKey]);
                        onChange?.(item);
                      }}
                    >
                      {item[valueKey]}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const features = [
    {
      icon: <QrCode className="h-5 w-5" />,
      title: "QR Code Ordering",
      description: "Digital menu with instant ordering",
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "Real-time Updates",
      description: "Live order tracking for staff",
    },
    {
      icon: <BarChart className="h-5 w-5" />,
      title: "Sales Analytics",
      description: "Detailed insights and reports",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Customer Management",
      description: "Track customer preferences",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                CafeFlow
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden sm:inline text-muted-foreground">Already have an account?</span>
              <Link href="/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container md:mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Form */}
          <div className="max-w-2xl mx-auto lg:mx-0">
            <div className="text-center lg:text-left mb-8">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div
                  ref={logoRef}
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary"
                >
                  <Coffee className="h-7 w-7 text-white" />
                </div>
                <h1
                  ref={textRef}
                  className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                >
                  CafeFlow
                </h1>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 animate-in">
                Start Your Free Trial
              </h2>
              <p className="text-lg text-muted-foreground mb-2 animate-in">
                Join 500+ cafes revolutionizing their operations
              </p>
              <Badge className="animate-in bg-gradient-to-r from-primary to-purple-600 text-white">
                <Zap className="h-3 w-3 mr-1" />
                14-day free trial • No credit card required
              </Badge>
            </div>

            <Card className="border-2 animate-in">
              <CardHeader>
                <CardTitle className="text-2xl">Create Your Account</CardTitle>
                <CardDescription>
                  Fill in your details to get started with CafeFlow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <FormField
                          name="name"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} className="h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Phone */}
                        <FormField
                          name="phone"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="9876543210" {...field} className="h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Email */}
                      <FormField
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="cafe@example.com" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Password */}
                      <FormField
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Cafe Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Cafe Information</h3>
                      
                      {/* Cafe Name */}
                      <FormField
                        name="cafeName"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Cafe Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Urban Brew Cafe" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Address */}
                      <FormField
                        name="address"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Street, Area, Landmark" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Pincode */}
                      <FormField
                        name="pincode"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Pincode</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter 6-digit Pincode"
                                maxLength={6}
                                {...field}
                                className="h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* State + City */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ComboBoxSelect
                          name="state"
                          label="State"
                          options={states}
                          onChange={(state) => {
                            setSelectedState(state);
                            const cityList = City.getCitiesOfState("IN", state.isoCode);
                            setCities(cityList);
                            form.setValue("city", "");
                          }}
                        />
                        
                        <ComboBoxSelect
                          name="city"
                          label="City"
                          options={cities}
                          onChange={(city) => {
                            form.setValue("city", city.name);
                          }}
                        />
                      </div>
                    </div>

                    {/* Terms and Submit */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          By signing up, you agree to our <Link href="/terms" className="text-primary underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>
                        </p>
                      </div>

                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full h-12 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Start Free Trial
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Already have an account?{" "}
                          <Link
                            href="/sign-in"
                            className="font-semibold text-primary hover:text-primary/80 underline"
                          >
                            Sign in here
                          </Link>
                        </p>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Benefits */}
          <div className="space-y-8 animate-in">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 px-4 py-1 text-sm font-semibold bg-gradient-to-r from-primary to-purple-600">
                <Users className="h-3 w-3 mr-1" />
                JOIN 500+ SUCCESSFUL CAFES
              </Badge>
              <h3 className="text-3xl font-bold mb-6">
                Everything You Get with CafeFlow
              </h3>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="p-3 rounded-lg w-fit mb-3 bg-blue-500/10">
                    <QrCode className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>QR Code Ordering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generate unique QR codes for tables. Customers scan to view menu and order instantly.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="p-3 rounded-lg w-fit mb-3 bg-green-500/10">
                    <Smartphone className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle>Real-time Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track orders, manage inventory, and view analytics from any device.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="p-3 rounded-lg w-fit mb-3 bg-purple-500/10">
                    <BarChart className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle>Advanced Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get insights on top-selling items, revenue trends, and customer behavior.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="p-3 rounded-lg w-fit mb-3 bg-amber-500/10">
                    <Shield className="h-6 w-6 text-amber-500" />
                  </div>
                  <CardTitle>Secure Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Accept multiple payment options with safe and reliable processing.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Features List */}
            <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl">All-Inclusive Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {feature.icon}
                      </div>
                      <div>
                        <p className="font-medium">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Card */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-white to-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="inline-flex items-baseline mb-4">
                    <span className="text-5xl font-bold text-primary">₹0</span>
                    <span className="text-muted-foreground ml-2">/ 14 days</span>
                  </div>
                  <p className="text-lg font-semibold mb-2">Free Trial Includes:</p>
                  <div className="space-y-2 text-left">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Full access to all features</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Unlimited QR codes & tables</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>24/7 customer support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>No credit card required</span>
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
                  <Coffee className="h-6 w-6 text-white" />
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