import { UserProfile } from "@clerk/nextjs";
import ThemeSection from "../components/ThemeSection";

export default function SettingsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">
          Configuration
        </p>

        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
          Paramètres
        </h1>

        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          Gérez votre compte et personnalisez votre expérience.
        </p>
      </div>
      <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <ThemeSection />
      </div>
      <div>
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">
            Compte
          </p>

          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Profil & Sécurité
          </h2>

          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Modifiez vos informations personnelles et votre sécurité.
          </p>
        </div>

        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "mb-4 w-full shadow-none border border-stone-200 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900",
              navbar: "hidden",
              pageScrollBox: "p-6",
            },
          }}
        />
      </div>{" "}
    </div>
  );
}
