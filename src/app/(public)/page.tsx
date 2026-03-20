import { Benefits } from "~/components/marketing/benefits";
import { CtaSection } from "~/components/marketing/cta-section";
import { Drivers } from "~/components/marketing/drivers";
import { Footer } from "~/components/marketing/footer";
import { Hero } from "~/components/marketing/hero";
import { HowItWorks } from "~/components/marketing/how-it-works";
import { Navbar } from "~/components/marketing/navbar";

export default function PublicHomePage() {
  return (
    <div className="relative">
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <HowItWorks />
        <Drivers />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
