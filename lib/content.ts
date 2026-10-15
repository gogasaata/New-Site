import { createClient } from "@supabase/supabase-js";

export type ContentField = {
  key: string;
  label: string;
  group: string;
  multiline?: boolean;
  hint?: string;
};

export const DEFAULT_CONTENT: Record<string, string> = {
  hero_eyebrow: "A GLOBAL PERSPECTIVE",
  hero_title_1: "Connecting",
  hero_title_2: "opportunities.",
  hero_text:
    "We bring together people, ideas and capital to build meaningful businesses and long-term value across markets and industries.",
  hero_cta: "ABOUT US",
  globe_image_url: "",

  biz_1_name: "VIN Technologies",
  biz_1_short: "Technology-driven solutions for global markets.",
  biz_1_full:
    "We transform ideas into digital opportunities. From blockchain and digital assets to innovative platforms and advanced technology solutions, we connect businesses with the technologies shaping tomorrow.",
  biz_2_name: "VIN Consulting",
  biz_2_short: "Strategic advisory for meaningful transformation.",
  biz_2_full:
    "We help businesses navigate new markets, build strategic partnerships, and unlock opportunities across regions. From market entry and business development to high-level connections, negotiations, and operational coordination, we turn complex challenges into seamless opportunities.",
  biz_3_name: "VIN Development",
  biz_3_short: "Creating places and businesses for a better future.",
  biz_3_full:
    "We identify, develop, and manage promising investment opportunities across industries and markets. By connecting innovative projects with investors, venture capital networks, and strategic partners, we transform ambitious ideas into sustainable businesses and long-term value.",

  about_title: "About Us",
  about_text:
    "VIN Holding brings together an international team of professionals from across the world, each with over 25 years of experience in business, investment, technology, and strategic development.\n\nOur strength lies in the diversity of our expertise, the depth of our relationships, and our ability to connect people, ideas, and opportunities across borders.\n\nWe believe that meaningful success is built on trust, innovation, and lasting partnerships.\n\nWith a global perspective and an entrepreneurial spirit, we turn connections into opportunities and opportunities into value.",

  investments_title: "Investments",
  investments_text:
    "By connecting innovative projects with investors, venture capital networks, and strategic partners, we transform ambitious ideas into sustainable businesses and long-term value.",
  partnerships_title: "Partnerships",
  partnerships_text:
    "We believe that meaningful success is built on trust, innovation, and lasting partnerships.\n\nOur strength lies in the diversity of our expertise, the depth of our relationships, and our ability to connect people, ideas, and opportunities across borders.",

  contact_title: "Contact",
  contact_text: "Let's connect. Tell us about your idea, project or opportunity.",
  contact_email: "info@vinholding.com",
  contact_phone: "",
  contact_address: "",
  footer_text: "VIN Holding. All rights reserved.",
};

export const CONTENT_FIELDS: ContentField[] = [
  { key: "hero_eyebrow", label: "Eyebrow", group: "Hero" },
  { key: "hero_title_1", label: "Title – line 1 (black)", group: "Hero" },
  { key: "hero_title_2", label: "Title – line 2 (burgundy)", group: "Hero" },
  { key: "hero_text", label: "Subtitle", group: "Hero", multiline: true },
  { key: "hero_cta", label: "Button label", group: "Hero" },
  {
    key: "globe_image_url",
    label: "Custom hero image URL (optional)",
    group: "Hero",
    hint: "Leave empty to use the built-in rotating 3D globe. Paste an image URL only if you want a static picture instead.",
  },

  { key: "about_title", label: "Section title", group: "About Us" },
  { key: "about_text", label: "Text (blank line = new paragraph)", group: "About Us", multiline: true },

  { key: "biz_1_name", label: "01 – Name", group: "Businesses" },
  { key: "biz_1_short", label: "01 – Short text", group: "Businesses" },
  { key: "biz_1_full", label: "01 – Full text", group: "Businesses", multiline: true },
  { key: "biz_2_name", label: "02 – Name", group: "Businesses" },
  { key: "biz_2_short", label: "02 – Short text", group: "Businesses" },
  { key: "biz_2_full", label: "02 – Full text", group: "Businesses", multiline: true },
  { key: "biz_3_name", label: "03 – Name", group: "Businesses" },
  { key: "biz_3_short", label: "03 – Short text", group: "Businesses" },
  { key: "biz_3_full", label: "03 – Full text", group: "Businesses", multiline: true },

  { key: "investments_title", label: "Investments – title", group: "Investments & Partnerships" },
  { key: "investments_text", label: "Investments – text", group: "Investments & Partnerships", multiline: true },
  { key: "partnerships_title", label: "Partnerships – title", group: "Investments & Partnerships" },
  { key: "partnerships_text", label: "Partnerships – text", group: "Investments & Partnerships", multiline: true },

  { key: "contact_title", label: "Section title", group: "Contact & Footer" },
  { key: "contact_text", label: "Intro text", group: "Contact & Footer", multiline: true },
  { key: "contact_email", label: "Email", group: "Contact & Footer" },
  { key: "contact_phone", label: "Phone", group: "Contact & Footer" },
  { key: "contact_address", label: "Address", group: "Contact & Footer" },
  { key: "footer_text", label: "Footer text", group: "Contact & Footer" },
];

export const ALLOWED_KEYS = new Set(Object.keys(DEFAULT_CONTENT));

export function supabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Defaults merged with whatever is stored in Supabase. Never throws. */
export async function getContent(): Promise<Record<string, string>> {
  const content = { ...DEFAULT_CONTENT };
  try {
    const sb = getSupabase();
    if (!sb) return content;
    const { data, error } = await sb.from("site_content").select("key,value");
    if (error || !data) return content;
    for (const row of data) {
      if (ALLOWED_KEYS.has(row.key) && typeof row.value === "string") {
        content[row.key] = row.value;
      }
    }
  } catch {
    /* fall back to defaults */
  }
  return content;
}
