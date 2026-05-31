import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function TemplatesSearch() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
      <Input
        placeholder="Rechercher un template..."
        className="pl-9 h-10 bg-white dark:bg-stone-900"
      />
    </div>
  );
}
