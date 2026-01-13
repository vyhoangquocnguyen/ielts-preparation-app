"use client";

import { useEffect, useRef } from "react";
import { Headphones, BookOpen, PenTool, Mic } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const modules = [
  {
    icon: Headphones,
    title: "Listening",
    description: "Practice with authentic audio recordings. Timed tests with instant feedback and transcripts.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BookOpen,
    title: "Reading",
    description: "Improve comprehension with varied passages. Multiple question types with detailed explanations.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: PenTool,
    title: "Writing",
    description: "Task 1 & Task 2 with AI feedback. Get scored on all 4 IELTS criteria with improvement suggestions.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Mic,
    title: "Speaking",
    description: "Record responses for Parts 1, 2, & 3. AI analyzes fluency, pronunciation, and vocabulary usage.",
    color: "from-purple-500 to-pink-500",
  },
];

export default function LandingModules() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".module-card");

      // Set initial state
      gsap.set(cards, { opacity: 0, scale: 0.8 });

      // Animate in
      gsap.to(cards, {
        opacity: 1,
        scale: 1,
        stagger: 0.15,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: 0.5,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="modules" className="py-24 px-4 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">All Four Modules Covered</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Practice and perfect every aspect of the IELTS exam</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <div
                key={index}
                className="module-card relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 hover:scale-105 group overflow-hidden">
                {/* Top gradient bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${module.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                />

                <div className="text-5xl mb-4">
                  <Icon className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{module.title}</h3>
                <p className="text-gray-400">{module.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
