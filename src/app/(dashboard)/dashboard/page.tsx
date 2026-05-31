import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/src/db";
import { documents } from "@/src/db/schema/documents";
import { templates } from "@/src/db/schema/templates";
import { users } from "@/src/db/schema/users";
import { auth, currentUser } from "@clerk/nextjs/server";
import { count, desc, eq, gte } from "drizzle-orm";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  FilePlus2,
  FileText,
  Layers,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getStats(companyId: string) {
  const [totalDocsResult] = await db
    .select({ count: count() })
    .from(documents)
    .where(eq(documents.companyId, companyId));

  const [totalTemplatesResult] = await db
    .select({ count: count() })
    .from(templates)
    .where(eq(templates.companyId, companyId));

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [monthDocsResult] = await db
    .select({ count: count() })
    .from(documents)
    .where(
      eq(documents.companyId, companyId) &&
        gte(documents.createdAt, startOfMonth),
    );

  const [lastDoc] = await db
    .select({
      id: documents.id,
      title: documents.title,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.companyId, companyId))
    .orderBy(desc(documents.createdAt))
    .limit(1);

  return {
    totalDocuments: totalDocsResult?.count ?? 0,
    totalTemplates: totalTemplatesResult?.count ?? 0,
    monthDocuments: monthDocsResult?.count ?? 0,
    lastDocument: lastDoc ?? null,
  };
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 30) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const firstName = clerkUser?.firstName ?? "là";

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  const stats = dbUser?.companyId
    ? await getStats(dbUser.companyId)
    : {
        totalDocuments: 0,
        totalTemplates: 0,
        monthDocuments: 0,
        lastDocument: null,
      };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="p-8 mx-auto">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 dark:text-stone-700 mb-1">
          Tableau de bord
        </p>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          {`Voici un aperçu de l'activité de votre cabinet.`}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {/* Documents générés */}
        <Card className="border border-stone-200 dark:border-stone-700 rounded-2xl shadow-sm bg-white dark:bg-stone-800">
          <CardHeader className="flex flex-row items-center justify-between px-6">
            <CardTitle className="text-xs tracking-widest uppercase text-stone-400 dark:text-stone-500">
              Documents générés
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700">
              <FileText className="h-4 w-4 text-stone-600 dark:text-stone-300" />
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <p className="text-4xl font-semibold text-stone-900 dark:text-stone-100">
              {stats.totalDocuments}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 flex items-center gap-1">
              Total depuis le début
              <TrendingUp className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card className="border border-stone-200 dark:border-stone-700 rounded-2xl shadow-sm bg-white dark:bg-stone-800">
          <CardHeader className="flex flex-row items-center justify-between px-6">
            <CardTitle className="text-xs tracking-widest uppercase text-stone-400 dark:text-stone-500">
              Templates
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700">
              <Layers className="h-4 w-4 text-stone-600 dark:text-stone-300" />
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <p className="text-4xl font-semibold text-stone-900 dark:text-stone-100">
              {stats.totalTemplates}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 flex items-center gap-1">
              Disponibles pour votre cabinet
              <TrendingUp className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Ce mois-ci */}
        <Card className="border border-stone-200 dark:border-stone-700 rounded-2xl shadow-sm bg-white dark:bg-stone-800">
          <CardHeader className="flex flex-row items-center justify-between px-6">
            <CardTitle className="text-xs tracking-widest uppercase text-stone-400 dark:text-stone-500">
              Ce mois-ci
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700">
              <CalendarDays className="h-4 w-4 text-stone-600 dark:text-stone-300" />
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <p className="text-4xl font-semibold text-stone-900 dark:text-stone-100">
              {stats.monthDocuments}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 flex items-center gap-1">
              Documents générés en{" "}
              {new Date().toLocaleDateString("fr-FR", { month: "long" })}
              <TrendingUp className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Dernier document */}
        <Card className="border border-stone-200 dark:border-stone-700 rounded-2xl shadow-sm bg-white dark:bg-stone-800">
          <CardHeader className="flex flex-row items-center justify-between px-6">
            <CardTitle className="text-xs tracking-widest uppercase text-stone-400 dark:text-stone-500">
              Dernier document
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700">
              <Clock className="h-4 w-4 text-stone-600 dark:text-stone-300" />
            </div>
          </CardHeader>
          <CardContent className="px-6">
            {stats.lastDocument ? (
              <>
                <p
                  className="text-lg font-bold text-stone-900 dark:text-stone-100 truncate leading-tight"
                  title={stats.lastDocument.title}
                >
                  {stats.lastDocument.title}
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(new Date(stats.lastDocument.createdAt))}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-stone-300 dark:text-stone-600">
                  Aucun document
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5">
                  Générez votre premier document
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-4">
          Actions rapides
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/dashboard/templates">
            <div className="group flex items-center gap-4 p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 transition-colors cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 dark:bg-stone-900/10">
                <FilePlus2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Nouveau document</p>
                <p className="text-xs text-white/60 dark:text-stone-900/60">
                  Générer depuis un template
                </p>
              </div>
              <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link href="/dashboard/templates">
            <div className="group flex items-center gap-4 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700">
                <Layers className="h-5 w-5 text-stone-600 dark:text-stone-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                  Voir les templates
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  Parcourir la bibliothèque
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-stone-400 dark:text-stone-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
