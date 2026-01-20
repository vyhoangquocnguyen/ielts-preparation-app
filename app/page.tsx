import LandingFeatures from "@/components/landing/landingFeatures";
import LandingHero from "@/components/landing/landingHero";
import LandingModules from "@/components/landing/landingModules";
import LandingNav from "@/components/landing/landingNav";
import LandingCTA from "@/components/landing/landingCTA";
import { Metadata } from "next";
import LandingFooter from "@/components/landing/landingFooter";

export const metadata: Metadata = {
  title: "IELTS Prep AI - Master Your IELTS with AI-Powered Learning",
  description:
    "Achieve your target band score with personalized feedback, realistic practice tests, and AI-driven insights across all four modules.",
};

const Home = () => {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <section className="relative z-10">
        {/* Landing Nav */}
        <LandingNav />
        {/* Landing Hero */}
        <LandingHero />
        {/* Landing Features */}
        <LandingFeatures />
        {/* Landing Modules */}
        <LandingModules />
        {/* Landing CTA */}
        <LandingCTA />
        {/* Landing Footer */}
        <LandingFooter />
      </section>
    </main>
  );
};

export default Home;
