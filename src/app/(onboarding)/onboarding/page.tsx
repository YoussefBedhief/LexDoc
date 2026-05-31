"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  Building2,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  // TODO: decompose this page to component to make it server side
  // TODO: if the user is authenticated we redirect to dashboard

  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    phone: "",
    address: "",
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'entreprise est requis.";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Adresse e-mail invalide.";
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok)
        throw new Error("Erreur lors de la création de l'entreprise.");

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setErrors({ form: "Une erreur s'est produite. Veuillez réessayer." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start sm:items-center bg-stone-50 dark:bg-stone-950 justify-center p-4">
      {/* Grid background */}
      <div className="fixed inset-0 opacity-[0.02] sm:opacity-[0.03] pointer-events-none dark:opacity-[0.04]" />

      <div className="w-full max-w-lg relative px-4 sm:px-0">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-stone-400 dark:text-stone-500">
            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold">
              1
            </span>
            <span className="hidden sm:inline">Inscription</span>
          </div>
          <div className="h-px flex-1 bg-stone-300 dark:bg-stone-700" />
          <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-stone-900 dark:text-stone-100">
            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold">
              2
            </span>
            <span className="hidden sm:inline">Votre entreprise</span>
          </div>
          <div className="h-px flex-1 bg-stone-300 dark:bg-stone-700" />
          <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-stone-300 dark:text-stone-600">
            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border border-stone-300 dark:border-stone-600 text-[10px] font-bold text-stone-400 dark:text-stone-500">
              3
            </span>
            <span className="hidden sm:inline">Tableau de bord</span>
          </div>
        </div>

        {/* Card */}
        <Card className="border border-stone-200 dark:border-stone-800 shadow-sm bg-white dark:bg-stone-900 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 pt-6 sm:pt-8 px-4 sm:px-8 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 dark:bg-stone-100">
                <Building2 className="h-5 w-5 text-white dark:text-stone-900" />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 dark:text-stone-500">
                  Onboarding
                </p>
                <CardTitle className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                  Configurez votre entreprise
                </CardTitle>
              </div>
            </div>
            <CardDescription className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
              Ces informations permettront de personnaliser votre espace de
              travail. Vous pourrez les modifier à tout moment.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-8 py-6 sm:py-7">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Nom */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400"
                >
                  {`Nom de l'entreprise`}{" "}
                  <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    className={`pl-9 h-10 rounded-lg border text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-colors focus-visible:ring-stone-900 dark:focus-visible:ring-stone-400 ${
                      errors.name
                        ? "border-red-300 dark:border-red-500 focus-visible:ring-red-400"
                        : "border-stone-200 dark:border-stone-700"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400"
                >
                  E-mail professionnel
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@acme.com"
                    className={`pl-9 h-10 rounded-lg border text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-colors focus-visible:ring-stone-900 dark:focus-visible:ring-stone-400 ${
                      errors.email
                        ? "border-red-300 dark:border-red-500 focus-visible:ring-red-400"
                        : "border-stone-200 dark:border-stone-700"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Téléphone */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400"
                >
                  Téléphone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+216 XX XXX XXX"
                    className="pl-9 h-10 rounded-lg border border-stone-200 dark:border-stone-700 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus-visible:ring-stone-900 dark:focus-visible:ring-stone-400"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="address"
                  className="text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400"
                >
                  Adresse
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Rue de la République, Tunis"
                    className="pl-9 h-10 rounded-lg border border-stone-200 dark:border-stone-700 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus-visible:ring-stone-900 dark:focus-visible:ring-stone-400"
                  />
                </div>
              </div>

              {/* Erreur globale */}
              {errors.form && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                  {errors.form}
                </p>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 sm:h-11 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900 text-white font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Création en cours…
                    </>
                  ) : (
                    <>
                      Continuer
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-stone-400 dark:text-stone-500 mt-5">
          Étape 2 sur 3 — Vous pouvez compléter ces informations plus tard.
        </p>
      </div>
    </div>
  );
}
