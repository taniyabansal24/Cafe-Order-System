"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { signUpSchema } from "@/schemas/signUpSchema";

export default function SignUpPage() {
  const router = useRouter();

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

  // ✅ Auto-fill state and city using pincode API
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

      toast.success(res.data.message);
      router.replace(
        `/verify?email=${encodeURIComponent(data.email)}&phone=${encodeURIComponent(formattedData.phone)}`
      );
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
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between text-left"
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-[95%] max-w-xl py-8 px-6 md:p-8 space-y-8 bg-white rounded-lg shadow-md my-2 md:my-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Cafe Order System
          </h1>
          <p className="mb-4">Sign-up to start your cafe order system</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ PHONE + CAFE NAME in a row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <FormField
                  name="phone"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full md:w-1/2">
                <FormField
                  name="cafeName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cafe Name</FormLabel>
                      <FormControl>
                        <Input placeholder="cafe name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address */}
            <FormField
              name="address"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Pincode Input */}
            <FormField
              name="pincode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter 6-digit Pincode"
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ STATE + CITY in a row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
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
              </div>
              <div className="w-full md:w-1/2">
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

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <p className="text-center text-sm mt-2">
              Already have an account?{" "}
              <Link href="/sign-in" className="underline text-blue-600">
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
