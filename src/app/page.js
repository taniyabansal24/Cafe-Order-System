// src/app/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Coffee,
  QrCode,
  BarChart3,
  RefreshCw,
  DollarSign,
  Smartphone,
  BarChart,
  Shield,
  Zap,
  Users,
  Star,
  Menu,
  Clock,
  CreditCard,
  Crown,
  TrendingUp,
  AlertTriangle,
  Utensils,
  Target,
  PieChart,
  LineChart,
  TrendingDown,
  ShoppingBag,
  Pizza,
  Package,
  Calendar,
  Award,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge } from "@/components/ui/badge.jsx";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: <QrCode className="h-8 w-8" />,
    title: "QR Code Ordering",
    description:
      "Customers scan a QR code, view the menu, and place orders instantly — no queue, no waiting.",
    color: "text-blue-500",
  },

  {
    icon: <Smartphone className="h-8 w-8" />,
    title: "Real-time Updates",
    description:
      "New orders automatically appear under Pending Orders for the owner and staff in real time.",
    color: "text-green-500",
  },

  {
    icon: <BarChart className="h-8 w-8" />,
    title: "Sales & Customer Insights",
    description:
      "Get clear analytics: top-selling items, revenue trends, customer behavior, and growth charts.",
    color: "text-purple-500",
  },

  {
    icon: <Users className="h-8 w-8" />,
    title: "Smart Order Management",
    description:
      "Track pending, active, and completed orders with one click — reduce mistakes and save time.",
    color: "text-indigo-500",
  },

  {
    icon: <Zap className="h-8 w-8" />,
    title: "Faster Service, Zero Crowds",
    description:
      "Reduce crowd at the counter. Save customer time and owner time with automated workflows.",
    color: "text-yellow-500",
  },

  {
    icon: <Shield className="h-8 w-8" />,
    title: "Secure Payments",
    description:
      "Accept multiple payment options with safe and reliable processing.",
    color: "text-red-500",
  },
];

const steps = [
  {
    number: "01",
    title: "Generate QR Code",
    description: "Create a unique QR code for each table",
    icon: <QrCode className="h-6 w-6" />,
  },
  {
    number: "02",
    title: "Customer Scans",
    description: "Customers scan to view digital menu",
    icon: <Smartphone className="h-6 w-6" />,
  },
  {
    number: "03",
    title: "Place Order",
    description: "Order directly from their phone",
    icon: <Menu className="h-6 w-6" />,
  },
  {
    number: "04",
    title: "Kitchen Receives",
    description: "Instant notification to kitchen staff",
    icon: <Clock className="h-6 w-6" />,
  },
  {
    number: "05",
    title: "Secure Payment",
    description: "Pay via multiple secure methods",
    icon: <CreditCard className="h-6 w-6" />,
  },
  {
    number: "06",
    title: "Feedback & Analytics",
    description: "Get insights and customer feedback",
    icon: <BarChart className="h-6 w-6" />,
  },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Cafe Owner, Mumbai",
    content:
      "Increased our daily orders by 40%! The system is incredibly efficient.",
    avatar: "RS",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Restaurant Manager, Delhi",
    content:
      "Reduced order errors by 90%. Our staff loves how organized everything is now.",
    avatar: "PP",
    rating: 5,
  },
  {
    name: "Ankit Verma",
    role: "Coffee Shop Owner, Bangalore",
    content:
      "Customer feedback has been amazing. The QR ordering is a game-changer.",
    avatar: "AV",
    rating: 5,
  },
];

const stats = [
  { label: "Orders Processed", value: "10,000+", icon: "📈" },
  { label: "Cafes Using", value: "500+", icon: "🏪" },
  { label: "Avg. Time Saved", value: "70%", icon: "⏱️" },
  { label: "Customer Rating", value: "4.8/5", icon: "⭐" },
];

export default function HomePage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    // Hero animation
    gsap.fromTo(
      ".hero-title",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(
      ".hero-subtitle",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" }
    );

    gsap.fromTo(
      ".hero-cta",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, delay: 0.6, ease: "back.out(1.7)" }
    );

    // Features animation
    gsap.utils.toArray(".feature-card").forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.1,
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Stats counter animation
    const counters = document.querySelectorAll(".stat-value");
    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target");
      const increment = target / 100;
      let current = 0;

      const updateCounter = () => {
        if (current < target) {
          current += increment;
          counter.textContent =
            Math.ceil(current) + (counter.textContent.includes("+") ? "+" : "");
          setTimeout(updateCounter, 20);
        } else {
          counter.textContent =
            target + (counter.textContent.includes("+") ? "+" : "");
        }
      };

      ScrollTrigger.create({
        trigger: counter,
        start: "top 80%",
        onEnter: () => updateCounter(),
        once: true,
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                CafeFlow
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="#features"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                How it Works
              </a>
              <a
                href="#testimonials"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Testimonials
              </a>
              <div className="flex items-center space-x-4">
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Get Started Free</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5" />
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 px-4 py-1 text-sm font-semibold animate-pulse">
              🚀 Trusted by 500+ Cafes Nationwide
            </Badge>

            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Revolutionize Your Cafe with
              <span className="block bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Smart QR Ordering
              </span>
            </h1>

            <p className="hero-subtitle text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Transform customer experience, boost efficiency, and increase
              revenue with our all-in-one digital ordering and management
              platform.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/sign-up">
                <Button size="lg" className="px-8 py-6 text-lg group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg"
                >
                  Watch Demo Video
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image/Animation */}
          <div className="mt-20 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-600/20 blur-3xl rounded-full" />
            <div className="relative bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-2">
              <div className="rounded-xl overflow-hidden border">
                <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        >
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        </div>
                      ))}
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                      <div className="h-8 bg-primary/20 rounded w-1/2 mx-auto mb-4" />
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-primary/10 rounded-full" />
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <span
                    className="stat-value"
                    data-target={stat.value.replace("+", "")}
                  >
                    {stat.value}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center justify-center gap-2">
                  <span>{stat.icon}</span>
                  <span>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Powerful Features for Modern Cafes
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to streamline operations and delight customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`feature-card border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${hoveredFeature === index ? "border-primary shadow-xl" : ""}`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader>
                  <div
                    className={`p-3 rounded-lg w-fit mb-4 ${feature.color} bg-opacity-10`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">How CafeFlow Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple 6-step process to transform your cafe operations
            </p>
          </div>

          <div className="relative">
            {/* Connection line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 transform -translate-y-1/2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow duration-300">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>
                    <div className="mt-6 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          {step.icon}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Analytics Showcase */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 px-4 py-1 bg-gradient-to-r from-primary to-purple-600 text-white">
              <BarChart3 className="h-3 w-3 mr-1" />
              AI-POWERED INSIGHTS
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Professional Analytics Dashboard
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Real-time insights and actionable data to grow your cafe business
            </p>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Sales Insights Card */}
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-green-500" />
                    Sales Analytics
                  </CardTitle>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Live Data
                  </Badge>
                </div>
                <CardDescription>
                  Track revenue, orders, and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Revenue
                    </p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                      ₹2.4L
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      This month
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                      1,247
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-500">
                      All time
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-green-500" />
                    Revenue Trends
                  </h4>
                  <div className="h-32 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-4">
                    <div className="flex h-full items-end space-x-1">
                      {[30, 45, 60, 75, 90, 85, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div
                            className="w-full bg-gradient-to-t from-green-500 to-green-600 rounded-t-lg transition-all hover:opacity-80"
                            style={{ height: `${h}%` }}
                          ></div>
                          <span className="text-xs mt-2 text-muted-foreground">
                            Day {i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-500" />
                    Key Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Avg Order Value
                      </p>
                      <p className="font-bold text-lg">₹850</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Growth Rate
                      </p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <p className="font-bold text-lg text-green-600">12%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  onClick={() => (window.location.href = "/sign-up")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Sales Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Customer Insights Card */}
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-blue-500" />
                    Customer Insights
                  </CardTitle>
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Real-time
                  </Badge>
                </div>
                <CardDescription>
                  Understand your customers better than ever
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Total Customers
                    </p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                      1,247
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ↑ 12%
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      Returning Rate
                    </p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                      72%
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        ↑ 5%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    Customer Segments
                  </h4>
                  <div className="h-32 flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <div
                        className="absolute inset-0 rounded-full border-8 border-blue-500"
                        style={{ clipPath: "inset(0 50% 0 0)" }}
                      ></div>
                      <div
                        className="absolute inset-0 rounded-full border-8 border-green-500"
                        style={{
                          clipPath: "inset(0 0 0 50%)",
                          transform: "rotate(120deg)",
                        }}
                      ></div>
                      <div
                        className="absolute inset-0 rounded-full border-8 border-purple-500"
                        style={{ clipPath: "inset(50% 0 0 0)" }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl font-bold">9 Orders</div>
                          <div className="text-xs text-muted-foreground">
                            Avg per customer
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Top Customer
                  </h4>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">Rahul S.</p>
                        <p className="text-sm text-muted-foreground">
                          15 orders
                        </p>
                      </div>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                        VIP Customer
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  onClick={() => (window.location.href = "/sign-up")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Customer Insights
                </Button>
              </CardContent>
            </Card>

            {/* Product Analytics Card - Updated to match product analytics page */}
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Package className="h-6 w-6 text-purple-500" />
                    Product Analytics
                  </CardTitle>
                  <Badge className="bg-purple-500 hover:bg-purple-600">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Live Analysis
                  </Badge>
                </div>
                <CardDescription>
                  Smart insights to optimize your menu
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      Total Products
                    </p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                      25
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-500">
                      In system
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-lg">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Top Category
                    </p>
                    <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                      Drinks
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500">
                      45% revenue
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    Top Selling Items
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Cappuccino",
                        sales: 156,
                        revenue: "₹46,800",
                        category: "drinks",
                        trend: "↑",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              item.category === "drinks"
                                ? "bg-blue-500/20"
                                : item.category === "snacks"
                                  ? "bg-amber-500/20"
                                  : "bg-green-500/20"
                            }`}
                          >
                            {item.category === "drinks" ? (
                              <Coffee className="h-4 w-4 text-blue-500" />
                            ) : item.category === "snacks" ? (
                              <Utensils className="h-4 w-4 text-amber-500" />
                            ) : (
                              <Pizza className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.sales} sales
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-700 dark:text-yellow-400"
                        >
                          {item.revenue}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Category Performance
                    </h4>
                    <div className="space-y-2">
                      {[
                        {
                          category: "Drinks",
                          percentage: 45,
                          color: "bg-blue-500",
                        },
                        {
                          category: "Snacks",
                          percentage: 30,
                          color: "bg-amber-500",
                        },
                        {
                          category: "Meals",
                          percentage: 25,
                          color: "bg-green-500",
                        },
                      ].map((cat, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${cat.color}`}
                            ></div>
                            <span className="text-sm">{cat.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${cat.color} rounded-full`}
                                style={{ width: `${cat.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {cat.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">Low Selling Items</p>
                        <p className="text-sm text-muted-foreground">
                          4 items need attention
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-red-500 hover:bg-red-600">View</Badge>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  onClick={() => (window.location.href = "/sign-up")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  View Product Analytics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Live Dashboard Metrics */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-3xl font-bold text-primary">12</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">4 preparing</span>
                  <span className="text-blue-600">8 pending</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 rounded-xl border-2 border-green-500/20 hover:border-green-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Today&apos;s Revenue
                  </p>
                  <p className="text-3xl font-bold text-green-600">₹24,850</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  18% above target
                </Badge>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 rounded-xl border-2 border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Month</p>
                  <p className="text-3xl font-bold text-purple-600">₹2.4L</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  65% of monthly target
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6 rounded-xl border-2 border-amber-500/20 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Top-Selling Item
                  </p>
                  <p className="text-xl font-bold text-amber-700">Cappuccino</p>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">156 sales</span>
                  <span className="font-bold text-green-600">₹46,800</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="px-10 py-6 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                <BarChart className="mr-2 h-5 w-5" />
                Access Full Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Real-time data • 30+ analytics metrics • AI-powered insights
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Cafe Owners</h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about CafeFlow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-2 hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-lg mb-6 italic">
                    &quot;{testimonial.content}&quot;
                  </p>

                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Cafe?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join 500+ cafes already using CafeFlow to streamline operations and
            boost revenue
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-transparent hover:border-2 hover:text-white px-10 py-6 text-lg"
              >
                Start Free 14-Day Trial
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-80">
            No credit card required • Cancel anytime • Full feature access
          </p>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">CafeFlow</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing cafe management since 2024
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>
              © 2024 CafeFlow. All rights reserved. Built with ❤️ for cafe
              owners worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
