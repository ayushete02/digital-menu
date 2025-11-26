"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Info } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

const formSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6).optional(),
  name: z.string().min(2).max(120).optional(),
  country: z.string().min(2).max(120).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type RequestCodeResponse =
  | { success: true; channel: "smtp" }
  | { success: false; channel: "console"; fallbackCode?: string };

export const LoginForm = () => {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      code: undefined,
      name: undefined,
      country: undefined,
    },
  });

  const sendCode = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      if (!res.ok) {
        throw new Error("Unable to send code");
      }
      const payload = (await res
        .json()
        .catch(() => null)) as RequestCodeResponse | null;
      setEmailSentTo(values.email);
      if (payload?.success) {
        setManualCode(null);
        toast.success("Verification code sent", {
          description: "Please check your inbox for the 6-digit code.",
        });
      } else {
        const fallback = payload?.fallbackCode ?? null;
        setManualCode(fallback);
        toast.success("Code ready", {
          description: fallback
            ? "Email delivery failed. Hover the info icon to view it."
            : "Email delivery failed. Check with support for your code.",
        });
      }
      setStep("code");
    } catch (error) {
      console.error(error);
      toast.error("Could not send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          code: values.code,
          name: values.name,
          country: values.country,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? "Invalid code");
      }

      toast.success("Signed in successfully");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    if (step === "email") {
      return sendCode(values);
    }

    return verifyCode(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={step === "code"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {step === "code" ? (
          <div className="space-y-4">
            <Separator />
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium">{emailSentTo}</span>.
              {manualCode && (
                <span
                  className="ml-2 inline-flex items-center text-primary"
                  title={`Email delivery failed. Use code ${manualCode}.`}
                >
                  <Info className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">
                    Email delivery failed. Use the displayed code.
                  </span>
                </span>
              )}
            </p>
            {manualCode && (
              <p className="text-xs text-muted-foreground">
                Your one-time code is{" "}
                <span className="font-semibold">{manualCode}</span>.
              </p>
            )}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Priya Sharma"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="India"
                      autoComplete="country-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify & continue"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={isLoading}
              onClick={() => {
                setStep("email");
                setIsLoading(false);
                form.setValue("code", undefined);
                form.setValue("name", undefined);
                form.setValue("country", undefined);
                setManualCode(null);
              }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send verification code"}
          </Button>
        )}
      </form>
    </Form>
  );
};
