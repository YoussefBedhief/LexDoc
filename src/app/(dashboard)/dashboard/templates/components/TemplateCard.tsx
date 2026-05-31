import { FileText, MoreVertical } from "lucide-react";

export default function TemplateCard({ template }: any) {
  return (
    <div className="group border border-stone-200 dark:border-stone-800 rounded-xl p-4 bg-white dark:bg-stone-900 hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-stone-500" />
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">
            {template.name}
          </h3>
        </div>

        <button className="opacity-0 group-hover:opacity-100 transition">
          <MoreVertical className="h-4 w-4 text-stone-400" />
        </button>
      </div>

      <p className="text-sm text-stone-500 mt-2">{template.description}</p>

      <div className="flex items-center justify-between mt-4 text-xs text-stone-400">
        <span>{template.variables} variables</span>
        <span>{template.updatedAt}</span>
      </div>
    </div>
  );
}
