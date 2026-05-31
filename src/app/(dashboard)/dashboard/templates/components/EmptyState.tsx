import { Layers } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Layers className="h-10 w-10 text-stone-300" />
      <p className="mt-4 text-stone-500 font-medium">
        Aucun template pour le moment
      </p>
      <p className="text-sm text-stone-400 mt-1">
        Créez votre premier template pour commencer
      </p>
    </div>
  );
}
