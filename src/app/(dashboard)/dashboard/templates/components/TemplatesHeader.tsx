import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TemplatesHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest text-stone-400">
          Bibliothèque
        </p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Templates
        </h1>
      </div>

      <Button className="gap-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900">
        <Plus className="h-4 w-4" />
        Nouveau template
      </Button>
    </div>
  );
}
