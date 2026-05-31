"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { TemplateField } from "../../page";
import { generateDocument } from "../action";

export interface Template {
  id: string;
  name: string;
  description: string | null;
  content: string;
  fields: TemplateField[];
}

interface Props {
  template: Template;
}

function replaceVariables(template: string, values: Record<string, string>) {
  let result = template;

  Object.entries(values).forEach(([key, value]) => {
    result = result.replaceAll(`{{${key}}}`, value || "");
  });

  return result;
}

export default function TemplateDetailsClient({ template }: Props) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const documentPreview = useMemo(() => {
    return replaceVariables(template.content, formValues);
  }, [template.content, formValues]);

  return (
    <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-6 mx-auto">
      {/* LEFT SIDE */}
      <Card className="h-fit">
        <CardContent className="p-6 space-y-5">
          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {template.name}
            </h1>

            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              {template.description}
            </p>
          </div>

          {/* DOCUMENT TITLE */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Nom du document
            </label>

            <Input
              placeholder="Ex: Divorce - Ahmed vs Fatima"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* FIELDS */}
          <div className="space-y-4">
            {template.fields?.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {field.label}
                </label>

                <Input
                  type={field.type || "text"}
                  placeholder={field.label}
                  value={formValues[field.name] || ""}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>

          {/* BUTTON */}
          <Button
            disabled={loading}
            className="w-full"
            onClick={async () => {
              setLoading(true);

              try {
                await generateDocument(template.id, formValues, title);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Génération..." : "Générer document"}
          </Button>
        </CardContent>
      </Card>

      {/* RIGHT SIDE */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Aperçu du document
            </h2>
          </div>

          <div className="bg-stone-100 dark:bg-stone-950 p-6 overflow-auto">
            <div className="bg-white text-black shadow-sm rounded-md max-w-[210mm] mx-auto min-h-[297mm]">
              <div
                dangerouslySetInnerHTML={{
                  __html: documentPreview,
                }}
                className="p-12 text-[15px] leading-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
