import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { About, Contact, Footer, Simple } from "@/components/Sections";
import { getContent } from "@/lib/content";

export const revalidate = 60;

export default async function Home() {
  const c = await getContent();
  return (
    <main>
      <Header />
      <Hero c={c} />
      <About c={c} />
      <Simple id="investments" no="INVESTMENTS" title={c.investments_title} text={c.investments_text} />
      <Simple id="partnerships" no="PARTNERSHIPS" title={c.partnerships_title} text={c.partnerships_text} />
      <Contact c={c} />
      <Footer c={c} />
    </main>
  );
}
