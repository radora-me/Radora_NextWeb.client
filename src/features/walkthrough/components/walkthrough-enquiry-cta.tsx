"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Compass, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  submitWalkthroughEnquiry,
  type WalkthroughEnquiry,
} from "@/features/walkthrough/services/enquiry.service";

const indianPhone = /^(?:\+91[ -]?)?[6-9]\d{9}$/;

const enquirySchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120, "Name is too long."),
  workEmail: z.string().trim().email("Enter a valid work email address.").max(254, "Email is too long."),
  organizationName: z.string().trim().min(2, "Enter your institution name.").max(160, "Institution name is too long."),
  contactNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(indianPhone, "Enter a valid Indian mobile number, with optional +91.")),
  designation: z.string().trim().max(100, "Designation is too long."),
  interests: z.string().trim().max(1000, "Please keep this under 1,000 characters."),
  consent: z.boolean().refine((value) => value, "Please acknowledge how your details will be used."),
});

type EnquiryFormValues = z.infer<typeof enquirySchema>;

const inputClass = "h-10 border-slate-200 bg-slate-50/60 focus-visible:ring-indigo-600";

export function WalkthroughEnquiryCta() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      fullName: "",
      workEmail: "",
      organizationName: "",
      contactNumber: "",
      designation: "",
      interests: "",
      consent: false,
    },
  });
  const consent = useWatch({ control, name: "consent" });

  const onSubmit = async (values: EnquiryFormValues) => {
    setSubmitError("");
    try {
      const payload: WalkthroughEnquiry = {
        fullName: values.fullName,
        workEmail: values.workEmail,
        organizationName: values.organizationName,
        contactNumber: values.contactNumber.replace(/[ -]/g, ""),
        ...(values.designation && { designation: values.designation }),
        ...(values.interests && { interests: values.interests }),
        consent: true,
      };
      await submitWalkthroughEnquiry(payload);
      setSubmitted(true);
      toast.success("Your request has been received.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit your request.";
      setSubmitError(message);
      toast.error("We couldn't submit your request", { description: message });
    }
  };

  const resetAndClose = (nextOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setSubmitted(false);
      setSubmitError("");
      reset();
    }
  };

  const startExploring = () => {
    window.sessionStorage.setItem("radora_product_tour_access", "confirmed");
    setOpen(false);
    router.push("/product-tour");
  };

  return (
    <>
      <motion.div
        className="mt-7 border-t border-slate-200 pt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18 }}
      >
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="group h-12 w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-base text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl hover:shadow-indigo-500/25"
        >
          <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
          Explore Radora
          <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
        <p className="mt-2 text-center text-xs text-slate-500">
          Experience how Radora simplifies institutional management.
        </p>
      </motion.div>

      <Dialog open={open} onOpenChange={resetAndClose}>
        <DialogContent
          className="max-h-[94dvh] w-[calc(100vw-1rem)] max-w-4xl overflow-y-auto rounded-[28px] border-0 bg-white p-0 shadow-[0_30px_100px_-28px_rgba(15,23,42,0.55)] sm:max-w-4xl"
          showCloseButton={!isSubmitting}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.section
                key="success"
                aria-live="polite"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-14 text-center sm:px-12 sm:py-20"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Radora walkthrough</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">You&apos;re all set!</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                  Your request has been received. Welcome to Radora&apos;s interactive product experience.
                </p>
                <Button onClick={startExploring} className="mt-8 h-11 bg-slate-900 px-6 text-white hover:bg-slate-800">
                  Start Exploring <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.section>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 px-7 py-8 text-white sm:px-10 sm:py-10 lg:px-12">
                  <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
                  <div className="absolute -bottom-28 left-1/3 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />
                  <div className="relative flex items-start gap-5 pr-7">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-inner shadow-white/10">
                      <Compass className="h-6 w-6 text-indigo-200" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">Your Radora experience</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Let&apos;s tailor your walkthrough</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Share a few details and we&apos;ll help you explore the parts of Radora that matter most to your team.</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 px-6 py-7 sm:px-12 sm:py-9 lg:px-14 lg:py-10">
                  <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                    <Field label="Full name" id="walkthrough-full-name" error={errors.fullName?.message}>
                      <Input id="walkthrough-full-name" autoComplete="name" placeholder="Your full name" className={`${inputClass} h-12 rounded-xl px-4`} aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "walkthrough-full-name-error" : undefined} {...register("fullName")} />
                    </Field>
                    <Field label="Official / work email" id="walkthrough-email" error={errors.workEmail?.message}>
                      <Input id="walkthrough-email" type="email" autoComplete="email" placeholder="you@institution.edu" className={`${inputClass} h-12 rounded-xl px-4`} aria-invalid={!!errors.workEmail} aria-describedby={errors.workEmail ? "walkthrough-email-error" : undefined} {...register("workEmail")} />
                    </Field>
                    <Field label="Institution name" id="walkthrough-organization" error={errors.organizationName?.message}>
                      <Input id="walkthrough-organization" autoComplete="organization" placeholder="Your institution or organization" className={`${inputClass} h-12 rounded-xl px-4`} aria-invalid={!!errors.organizationName} aria-describedby={errors.organizationName ? "walkthrough-organization-error" : undefined} {...register("organizationName")} />
                    </Field>
                    <Field label="Contact number" id="walkthrough-phone" error={errors.contactNumber?.message}>
                      <Input id="walkthrough-phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210" className={`${inputClass} h-12 rounded-xl px-4`} aria-invalid={!!errors.contactNumber} aria-describedby={errors.contactNumber ? "walkthrough-phone-error" : undefined} {...register("contactNumber")} />
                    </Field>
                    <Field className="sm:col-span-2" label="Designation (optional)" id="walkthrough-designation" error={errors.designation?.message}>
                      <Input id="walkthrough-designation" autoComplete="organization-title" placeholder="e.g. Principal, Administrator" className={`${inputClass} h-12 rounded-xl px-4`} aria-invalid={!!errors.designation} aria-describedby={errors.designation ? "walkthrough-designation-error" : undefined} {...register("designation")} />
                    </Field>
                  </div>

                  <Field label="What are you interested in exploring? (optional)" id="walkthrough-interests" error={errors.interests?.message}>
                    <Textarea id="walkthrough-interests" rows={4} placeholder="Tell us which areas matter most to your team…" className="min-h-28 rounded-xl border-slate-200 bg-slate-50/60 px-4 py-3 focus-visible:ring-indigo-600" aria-invalid={!!errors.interests} aria-describedby={errors.interests ? "walkthrough-interests-error" : undefined} {...register("interests")} />
                  </Field>

                  <div className="space-y-1">
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                      <Checkbox
                        id="walkthrough-consent"
                        checked={consent}
                        onCheckedChange={(checked) => setValue("consent", checked === true, { shouldValidate: true, shouldDirty: true })}
                        aria-invalid={!!errors.consent}
                        aria-describedby={errors.consent ? "walkthrough-consent-error" : undefined}
                        className="mt-0.5"
                      />
                      <Label htmlFor="walkthrough-consent" className="cursor-pointer text-xs leading-5 text-slate-600">
                        I acknowledge that Radora may use these details to respond to my product walkthrough request.
                      </Label>
                    </div>
                    {errors.consent && <p id="walkthrough-consent-error" role="alert" className="text-xs text-rose-600">{errors.consent.message}</p>}
                  </div>

                  {submitError && (
                    <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {submitError}
                    </p>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="h-11 w-full bg-indigo-600 text-white shadow-md shadow-indigo-600/15 hover:bg-indigo-700">
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending request…</> : <>Request walkthrough <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                  <p className="text-center text-[11px] leading-4 text-slate-400">Your information is used to respond to this request. We never ask for account credentials here.</p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  id,
  error,
  children,
  className,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={id} className="text-xs font-medium text-slate-700">{label}</Label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
