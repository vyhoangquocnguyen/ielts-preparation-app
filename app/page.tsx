import LandingFeatures from "@/components/landing/landingFeatures";
import LandingHero from "@/components/landing/landingHero";
import LandingModules from "@/components/landing/landingModules";
import LandingNav from "@/components/landing/landingNav";
import LandingCTA from "@/components/landing/loadingCTA";

export const meta = {
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
      </section>
      <footer className="py-8 px-4 border-t border-indigo-500/10 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} IELTS Prep AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
};

export default Home;
