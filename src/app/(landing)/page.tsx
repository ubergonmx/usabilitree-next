import { Header } from "./_sections/header";
import { HeroSection } from "./_sections/hero";
import { Footer } from "./_sections/footer";
import FAQ from "./_sections/faq";

export const metadata = {
  title: "Free Tree Testing & Card Sorting Tool",
  description:
    "Create, conduct, and analyze tree testsing and card sorting for free. Optimize your information architecture with valuable insights.",
};

export default async function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <FAQ />
      <Footer />
    </main>
  );
}
