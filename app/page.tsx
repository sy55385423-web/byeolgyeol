import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Evidence from "@/components/landing/Evidence";
import Bubbles from "@/components/landing/Bubbles";
import PromoBanner from "@/components/landing/PromoBanner";
import CategoryGrid from "@/components/landing/CategoryGrid";
import PreviewPromo from "@/components/landing/PreviewPromo";
import ReportShowcase from "@/components/landing/ReportShowcase";
import NightSection from "@/components/landing/NightSection";
import Pricing from "@/components/landing/Pricing";
import Reviews from "@/components/landing/Reviews";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Evidence />
      <Bubbles />
      <PromoBanner />
      <CategoryGrid />
      <PreviewPromo />
      <ReportShowcase />
      <NightSection />
      <Pricing />
      <Reviews />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
