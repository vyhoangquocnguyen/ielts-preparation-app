"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { ArrowRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLButtonElement>(null);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      });
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.4,
        ease: "power3.out",
      });
      gsap.from(buttonRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.6,
        ease: "power3.out",
      });
      gsap.from(statsRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.8,
        ease: "power3.out",
      });
      gsap.from(".stat-number", {
        textContent: 0,
        duration: 2,
        delay: 1,
        ease: "power1.out",
        snap: { textContent: 1 },
        stagger: 0.2,
      });

      // Fade out indicator on scroll
      if (indicatorRef.current) {
        gsap.to(indicatorRef.current, {
          opacity: 0,
          y: 20,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom center",
            scrub: true,
          },
        });
      }
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-1/4 left-[10%] w-24 h-24 bg-linear-to-br from-indigo-500/20 to-emerald-500/20 rounded-3xl blur-xl animate-float" />
      <div className="absolute bottom-1/4 right-[10%] w-32 h-32 bg-linear-to-br from-amber-500/20 to-indigo-500/20 rounded-3xl blur-xl animate-float-delayed" />
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Title */}
        <h1 ref={titleRef} className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Master IELTS with
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            AI-Powered Learning
          </span>
        </h1>

        {/* Subtitle */}
        <p ref={subtitleRef} className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">
          Achieve your target band score with personalized feedback, realistic practice tests, and AI-driven insights
          across all four modules.
        </p>

        {/* Buttons */}
        <div ref={buttonRef} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 group">
              Start Now
              <ArrowRightIcon className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="#features">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10">
              Learn More
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="flex flex-wrap gap-8 md:gap-16 justify-center">
          <div className="stat-item">
            <div className="stat-number text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              100+
            </div>
            <div className="text-gray-500 text-sm md:text-base mt-1">Active Learners</div>
          </div>
          <div className="stat-item">
            <div className="stat-number text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              7.5
            </div>
            <div className="text-gray-500 text-sm md:text-base mt-1">Average Band Score</div>
          </div>
          <div className="stat-item">
            <div className="stat-number text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              98
            </div>
            <div className="text-gray-500 text-sm md:text-base mt-1">Success Rate %</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToFeatures}
          ref={indicatorRef}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20 hover:text-indigo-400 transition-colors">
          <ChevronDownIcon className="w-8 h-8 text-indigo-500 cursor-pointer" />
        </button>
      </div>
    </section>
  );
}
