import EmptyState from "./EmptyState";
import TemplateCard from "./TemplateCard";

export const fakeTemplates = [
  {
    id: "tpl_1",
    title: "Mise en demeure",
    description: "Lettre officielle de mise en demeure",
    category: "Contentieux",
    content: `
Madame/Monsieur {{client_name}},

Nous vous mettons en demeure de payer la somme de {{amount}} DT avant le {{deadline}}.

À défaut, nous engagerons les procédures nécessaires.
    `,
    variables: ["client_name", "amount", "deadline"],
  },
  {
    id: "tpl_2",
    title: "Contrat de prestation",
    description: "Contrat simple de service",
    category: "Contrats",
    content: `
Entre {{client_name}} et le prestataire.

Objet : {{service_description}}

Montant : {{price}} DT
Durée : {{duration}}
    `,
    variables: ["client_name", "service_description", "price", "duration"],
  },
  {
    id: "tpl_3",
    title: "Convention d’honoraires",
    description: "Fixation des honoraires avocat-client",
    category: "Cabinet",
    content: `
Entre Maître {{lawyer_name}} et {{client_name}}

Honoraires fixés à {{fee_amount}} DT.
    `,
    variables: ["lawyer_name", "client_name", "fee_amount"],
  },
  {
    id: "tpl_divorce_1",
    title: "عريضة طلاق بالتراضي",
    description: "Acte de divorce par consentement mutuel (modèle avocat)",
    category: "Family Law",

    content: `
<div dir="rtl" style="font-family: serif; line-height: 2; font-size: 18px;">

  <!-- Header -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
    <span>{{city}}</span>
    <span>{{date}}</span>
    <span>الأستاذ : {{lawyer_name}}</span>
  </div>

  <p>
    محام لدى مجلس قضاء {{court_location}}
  </p>

  <p>
    العنوان : {{lawyer_address}}
  </p>

  <br/>

  <p>
    لفائدة : {{plaintiff_name}}
  </p>

  <p>
    موطناً مختاراً لها : {{plaintiff_address}}
  </p>

  <p>
    ضد : {{defendant_name}}
  </p>

  <p>
    موطناً مختاراً له : {{defendant_address}}
  </p>

  <br/>

  <h2 style="text-align:center; margin:40px 0;">
    عريضة مشتركة بشأن الطلاق بالتراضي
  </h2>

  <p>
    إلى السيد رئيس محكمة {{court_name}} قسم شؤون الأسرة
  </p>

  <br/>

  <p>
    تحية طيبة وبعد،
  </p>

  <p>
    يتشرف طرفي الدعوى أن يتقدما بهذه العريضة من أجل فك الرابطة الزوجية بالطلاق بالتراضي قبل الدخول وبدون قيد أو شرط.
  </p>

  <p>
    حيث أن الطرفين:
  </p>

  <p>
    - {{plaintiff_name}}، مواليد {{plaintiff_birthdate}}، الجنسية {{plaintiff_nationality}}
  </p>

  <p>
    - {{defendant_name}}، مواليد {{defendant_birthdate}}، الجنسية {{defendant_nationality}}
  </p>

  <p>
    مربوطين بعقد زواج رسمي رقم {{marriage_contract_number}}
    مسجل بتاريخ {{marriage_date}}
    لدى بلدية {{marriage_city}}
  </p>

  <p>
    وحيث أن الطرفين متفقان على فك الرابطة الزوجية بالتراضي.
  </p>

  <br/>

  <p>
    لهذه الأسباب ومن أجلها، يلتمس الطرفان من هيئة المحكمة الموقرة:
  </p>

  <p>
    1/ من حيث الشكل:
    قبول الدعوى شكلاً لورودها طبقاً للقانون.
  </p>

  <p>
    2/ من حيث الموضوع:
  </p>

  <p>
    - الإشهاد بأن الطرفين متزوجان بعقد رسمي رقم {{marriage_contract_number}}
  </p>

  <p>
    - الإشهاد على اتفاق الطرفين على الطلاق بالتراضي
  </p>

  <p>
    - الحكم بفك الرابطة الزوجية بين الطرفين
  </p>

  <p>
    مع جعل المصاريف القضائية على من تجب قانوناً.
  </p>

  <br/><br/><br/>

  <!-- Footer signature -->
  <div style="text-align:left;">
    <p>عن العارضين وكيليهما</p>
    <p>{{lawyer_name}}</p>
  </div>

</div>
`,

    variables: [
      "city",
      "date",
      "lawyer_name",
      "court_location",
      "lawyer_address",
      "plaintiff_name",
      "plaintiff_address",
      "defendant_name",
      "defendant_address",
      "court_name",
      "plaintiff_birthdate",
      "plaintiff_nationality",
      "defendant_birthdate",
      "defendant_nationality",
      "marriage_contract_number",
      "marriage_date",
      "marriage_city",
    ],
  },
];

export default function TemplatesGrid() {
  if (fakeTemplates.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {fakeTemplates.map((tpl) => (
        <TemplateCard key={tpl.id} template={tpl} />
      ))}
    </div>
  );
}
