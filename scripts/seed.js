const fs = require("fs");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

function loadEnv() {
  const envPath = ".env";
  if (!fs.existsSync(envPath)) {
    console.log("NO_ENV");
    process.exit(0);
  }
  const raw = fs.readFileSync(envPath, "utf8");
  const env = {};
  raw.split(/\r?\n/).forEach((line) => {
    if (!line || line.startsWith("#") || !line.includes("=")) return;
    const [key, ...rest] = line.split("=");
    env[key.trim()] = rest.join("=").trim();
  });
  return env;
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeName(value) {
  return value.toLowerCase().trim();
}

function hashText(value) {
  return crypto.createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

async function main() {
  const env = loadEnv();
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log("MISSING_ENV");
    process.exit(0);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const companiesSeed = [
    {
      name: "Atlas Teknoloji",
      short_description: "SaaS urunleri gelistiren teknoloji ekibi.",
      city: "Istanbul",
      sector: "Teknoloji",
      employee_size_bucket: "51-200",
    },
    {
      name: "Marmara Finans",
      short_description: "KOBI odakli finansal hizmetler.",
      city: "Istanbul",
      sector: "Finans",
      employee_size_bucket: "201-1000",
    },
    {
      name: "Ege Saglik",
      short_description: "Saglik teknolojileri ve klinik cozumler.",
      city: "Izmir",
      sector: "Saglik",
      employee_size_bucket: "11-50",
    },
    {
      name: "Anka Lojistik",
      short_description: "Yurt ici tasima ve depolama hizmetleri.",
      city: "Ankara",
      sector: "Lojistik",
      employee_size_bucket: "51-200",
    },
  ];

  const companiesPayload = companiesSeed.map((company) => ({
    ...company,
    normalized_name: normalizeName(company.name),
    slug: slugify(company.name),
    created_by_role: "admin",
    status: "active",
  }));

  const { data: companies, error: companyError } = await supabase
    .from("companies")
    .upsert(companiesPayload, { onConflict: "slug" })
    .select("id, name, slug");

  if (companyError) {
    console.log("COMPANY_SEED_ERROR", companyError.message);
    process.exit(1);
  }

  console.log("COMPANY_SEED_OK", companies.length);

  const usersSeed = [
    { email: "demo1@firmascope.local", password: "DemoPass123!" },
    { email: "demo2@firmascope.local", password: "DemoPass123!" },
    { email: "demo3@firmascope.local", password: "DemoPass123!" },
  ];

  const userIds = [];
  for (const user of usersSeed) {
    const { data: existing } = await supabase
      .schema("auth")
      .from("users")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (existing?.id) {
      userIds.push(existing.id);
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (error || !data?.user?.id) {
      console.log("USER_CREATE_ERROR", user.email, error?.message);
      continue;
    }
    userIds.push(data.user.id);
  }

  if (!userIds.length) {
    console.log("NO_USERS_AVAILABLE");
    process.exit(1);
  }

  const reviewsPayload = [];
  for (let i = 0; i < companies.length; i += 1) {
    const company = companies[i];
    const userId = userIds[i % userIds.length];
    const text = `Firma deneyimi: ${company.name} icin ornek yorum metni. Ekip ve surecler hakkinda genel bilgi paylasimi.`;
    reviewsPayload.push({
      company_id: company.id,
      user_id: userId,
      ip_hash: null,
      rating_overall: 4,
      ratings_json: { culture: 4, management: 3, work_life: 4 },
      answers_json: { employment_status: "current", work_type: "hybrid" },
      text,
      text_hash: hashText(text),
    });
  }

  for (const review of reviewsPayload) {
    const { count } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("company_id", review.company_id)
      .eq("text_hash", review.text_hash);

    if ((count ?? 0) > 0) continue;
    await supabase.from("reviews").insert(review);
  }

  console.log("REVIEWS_SEEDED", reviewsPayload.length);

  const salariesPayload = companies.map((company, index) => ({
    company_id: company.id,
    user_id: userIds[index % userIds.length],
    position: "Software Engineer",
    city: company.slug.includes("ank") ? "Ankara" : "Istanbul",
    experience_years: 3,
    work_type: "hybrid",
    company_size_bucket: "51-200",
    net_monthly_try: 45000,
    ip_hash: null,
  }));

  for (const salary of salariesPayload) {
    await supabase.from("salaries").insert(salary);
  }
  console.log("SALARIES_SEEDED", salariesPayload.length);

  const interviewsPayload = companies.map((company, index) => ({
    company_id: company.id,
    user_id: userIds[index % userIds.length],
    stage_data: { stages: ["HR", "Tech", "Offer"] },
    text: `${company.name} icin ornek mulakat notu. Surec netti ve geri bildirim verildi.`,
    outcome: "offer",
  }));

  for (const interview of interviewsPayload) {
    await supabase.from("interviews").insert(interview);
  }
  console.log("INTERVIEWS_SEEDED", interviewsPayload.length);
}

main().catch((err) => {
  console.log("SEED_ERROR", err?.message || err);
  process.exit(1);
});
