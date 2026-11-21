import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import SportsShowcase from "@/components/landing/SportsShowcase";
import Stats from "@/components/landing/Stats";
import MembershipTeaser from "@/components/landing/MembershipTeaser";
import AvailabilityStrip from "@/components/landing/AvailabilityStrip";
import ShopTeaser from "@/components/landing/ShopTeaser";
import BarSocial from "@/components/landing/BarSocial";
import Testimonials from "@/components/landing/Testimonials";
import LocationContact from "@/components/landing/LocationContact";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <Navbar />
      <Hero />
      <SportsShowcase />
      <Stats />
      <MembershipTeaser />
      <AvailabilityStrip />
      <ShopTeaser />
      <BarSocial />
      <Testimonials />
      <LocationContact />
      <Footer />
    </main>
  );
}
