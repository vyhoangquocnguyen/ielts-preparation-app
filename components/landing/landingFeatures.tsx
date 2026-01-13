"use client";
import { BarChart3, BookOpen, Bot, Mic, Target, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: Bot,
    title: "AI-Powered Learning",
    description:
      "Get instant, detailed feedback on your writing and speaking with our advanced AI that analyzes pronunciation, grammar, and fluency.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track your progress with comprehensive analytics. Identify strengths and weaknesses to focus your study efforts effectively.",
  },
  {
    icon: Target,
    title: "Personalized Learning",
    description:
      "Adaptive practice tests that adjust to your skill level. Get recommendations tailored to your improvement areas.",
  },
  {
    icon: Zap,
    title: "Instant Scoring",
    description:
      "Receive immediate band scores for listening and reading. Know exactly where you stand with our accurate scoring system.",
  },
  {
    icon: Mic,
    title: "Speech Recognition",
    description:
      "Practice speaking with advanced speech-to-text technology. Get pronunciation feedback and fluency analysis.",
  },
  {
    icon: BookOpen,
    title: "Comprehensive Library",
    description:
      "Access hundreds of practice exercises across all modules. New content added regularly to keep you challenged.",
  },
];
export default function LandingFeatures() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");

      // Set initial state
      gsap.set(cards, { opacity: 0, y: 50 });

      // Animate in
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.3,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);
  return (
    <section ref={sectionRef} id="feature" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose IELTS Prep AI?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to excel in your IELTS exam, powered by cutting-edge AI technology
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="feature-card p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-indigo-500/10 hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
