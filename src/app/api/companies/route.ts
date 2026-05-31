import { db } from "@/src/db";
import { companies } from "@/src/db/schema/companies";
import { templates } from "@/src/db/schema/templates";
import { users } from "@/src/db/schema/users";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const DEFAULT_TEMPLATES = [
  {
    name: "عريضة طلاق بالتراضي",
    description:
      "Template juridique pour acte de divorce par consentement mutuel",
    content: `
<div dir="rtl" style="font-family: serif;font-size:18px;">

  <!-- Header -->
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <span> في : {{city}} في : {{date}}</span>
    <span>الأستاذ : {{lawyer_name}}</span>
  </div>

  <p>محام لدى مجلس قضاء {{court_location}}</p>
  <p>العنوان : {{lawyer_address}}</p>
  <br/>
  <p>لفائدة : {{plaintiff_name}}</p>
  <p>موطناً مختاراً لها : {{plaintiff_address}}</p>
  <p>ضد : {{defendant_name}}</p>
  <p>موطناً مختاراً له : {{defendant_address}}</p>
  <br/>

  <h2 style="text-align:center; margin:40px 0;">
    عريضة مشتركة بشأن الطلاق بالتراضي
  </h2>

  <p>إلى السيد رئيس محكمة {{court_name}} قسم شؤون الأسرة</p>
  <br/>
  <p>تحية طيبة وبعد،</p>
  <p>يتشرف طرفي الدعوى أن يتقدما بهذه العريضة من أجل فك الرابطة الزوجية بالطلاق بالتراضي قبل الدخول وبدون قيد أو شرط.</p>
  <p>حيث أن الطرفين:</p>
  <p>- {{plaintiff_name}}، مواليد {{plaintiff_birthdate}}، الجنسية {{plaintiff_nationality}}</p>
  <p>- {{defendant_name}}، مواليد {{defendant_birthdate}}، الجنسية {{defendant_nationality}}</p>
  <p>مربوطين بعقد زواج رسمي رقم {{marriage_contract_number}} مسجل بتاريخ {{marriage_date}} لدى بلدية {{marriage_city}}</p>
  <p>وحيث أن الطرفين متفقان على فك الرابطة الزوجية بالتراضي.</p>
  <br/>
  <p>لهذه الأسباب ومن أجلها، يلتمس الطرفان من هيئة المحكمة الموقرة:</p>
  <p>1/ من حيث الشكل: قبول الدعوى شكلاً لورودها طبقاً للقانون.</p>
  <p>2/ من حيث الموضوع:</p>
  <p>- الإشهاد بأن الطرفين متزوجان بعقد رسمي رقم {{marriage_contract_number}}</p>
  <p>- الإشهاد على اتفاق الطرفين على الطلاق بالتراضي</p>
  <p>- الحكم بفك الرابطة الزوجية بين الطرفين</p>
  <p>مع جعل المصاريف القضائية على من تجب قانوناً.</p>
  <br/><br/><br/>

  <div style="text-align:left;">
    <p>عن العارضين وكيليهما</p>
    <p>{{lawyer_name}}</p>
  </div>

</div>`,
    fields: [
      { name: "city", label: "Ville", type: "text", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      {
        name: "lawyer_name",
        label: "Nom avocat",
        type: "text",
        required: true,
      },
      {
        name: "court_location",
        label: "Conseil judiciaire",
        type: "text",
        required: true,
      },
      {
        name: "lawyer_address",
        label: "Adresse avocat",
        type: "text",
        required: true,
      },
      {
        name: "plaintiff_name",
        label: "Nom demandeur",
        type: "text",
        required: true,
      },
      {
        name: "plaintiff_address",
        label: "Adresse demandeur",
        type: "text",
        required: true,
      },
      {
        name: "defendant_name",
        label: "Nom défendeur",
        type: "text",
        required: true,
      },
      {
        name: "defendant_address",
        label: "Adresse défendeur",
        type: "text",
        required: true,
      },
      {
        name: "court_name",
        label: "Nom du tribunal",
        type: "text",
        required: true,
      },
      {
        name: "plaintiff_birthdate",
        label: "Date naissance demandeur",
        type: "date",
        required: true,
      },
      {
        name: "plaintiff_nationality",
        label: "Nationalité demandeur",
        type: "text",
        required: true,
      },
      {
        name: "defendant_birthdate",
        label: "Date naissance défendeur",
        type: "date",
        required: true,
      },
      {
        name: "defendant_nationality",
        label: "Nationalité défendeur",
        type: "text",
        required: true,
      },
      {
        name: "marriage_contract_number",
        label: "Numéro contrat mariage",
        type: "text",
        required: true,
      },
      {
        name: "marriage_date",
        label: "Date mariage",
        type: "date",
        required: true,
      },
      {
        name: "marriage_city",
        label: "Ville mariage",
        type: "text",
        required: true,
      },
    ],
  },
];

export async function POST(req: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, phone, address } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Company name is required." },
      { status: 422 },
    );
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!dbUser) {
    return NextResponse.json(
      { error: "User not found in database" },
      { status: 404 },
    );
  }

  if (dbUser.companyId) {
    return NextResponse.json(
      { error: "User is already linked to a company" },
      { status: 409 },
    );
  }

  const [company] = await db
    .insert(companies)
    .values({
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
    })
    .returning();

  await db
    .update(users)
    .set({ companyId: company.id })
    .where(eq(users.clerkUserId, clerkUserId));

  await db.insert(templates).values(
    DEFAULT_TEMPLATES.map((t) => ({
      companyId: company.id,
      name: t.name,
      description: t.description,
      content: t.content.trim(),
      fields: t.fields,
    })),
  );

  return NextResponse.json(company, { status: 201 });
}
