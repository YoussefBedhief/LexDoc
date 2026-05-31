import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/src/db";
import { templates } from "@/src/db/schema/templates";
import { users } from "@/src/db/schema/users";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export interface TemplateField {
  name: string;
  label: string;
  type: "text" | "date" | "select" | "number";
  required: boolean;
}

export default async function TemplatesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!dbUser?.companyId) {
    redirect("/onboarding");
  }

  const companyTemplates = await db
    .select()
    .from(templates)
    .where(eq(templates.companyId, dbUser.companyId));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Templates
          </h1>

          <p className="text-sm text-stone-500 dark:text-stone-400">
            Gérez et utilisez vos modèles de documents juridiques
          </p>
        </div>

        <Link href="/dashboard/templates/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau template
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />

        <Input placeholder="Rechercher un template..." className="pl-9" />
      </div>

      {/* Empty state */}
      {companyTemplates.length === 0 && (
        <div className="border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-12 text-center bg-white dark:bg-stone-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
            <FileText className="h-6 w-6 text-stone-500" />
          </div>

          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Aucun template
          </h2>

          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 mb-6">
            Commencez par créer votre premier modèle juridique.
          </p>

          <Link href="/dashboard/templates/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un template
            </Button>
          </Link>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companyTemplates.map((tpl) => (
          <Link key={tpl.id} href={`/dashboard/templates/${tpl.id}`}>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-stone-500 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors" />

                  {tpl.name}
                </CardTitle>

                {tpl.description && (
                  <p className="text-xs text-stone-500">{tpl.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Variables */}
                <div className="flex flex-wrap gap-1">
                  {(tpl.fields as TemplateField[])?.map((field) => (
                    <span
                      key={field.name}
                      className="text-[10px] px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    >
                      {field.label}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-stone-400">
                    Cliquer pour utiliser
                  </p>

                  <span className="text-xs text-stone-300 group-hover:text-stone-500 transition-colors">
                    →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
