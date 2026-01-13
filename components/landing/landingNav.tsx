"use client";

import { Activity, useEffect, useState } from "react";
import Link from "next/link";
import { Bars3Icon, GlobeAltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/button";

const LandingNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? " border-b border-indigo-950/10" : "bg-transparent"
      }`}>
      {/* Logo */}
      <div className="container mx-auto">
        <div className="flex items-center justify-between mx-auto px-4">
          <Link href="/" className="flex h-16 shrink-0 items-center gap-x-2 mt-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-800 to-blue-600">
              <GlobeAltIcon className="h-5 w-5 text-white " />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              IELTS<span className="text-purple-600 text-md">Prep</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#modules" className="text-gray-300 hover:text-white transition-colors">
              Modules
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <Link href="/sign-in">
              <Button variant="ghost" className="text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <Activity mode={isMobileMenuOpen ? "visible" : "hidden"}>
          <div className="md:hidden mt-4 px-6 mx-auto space-y-4 ">
            <a
              href="#features"
              className="block text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}>
              Features
            </a>
            <a
              href="#modules"
              className="block text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}>
              Modules
            </a>
            <a
              href="#pricing"
              className="block text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}>
              Pricing
            </a>
            <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700">Get Started</Button>
            </Link>
          </div>
        </Activity>
      </div>
    </nav>
  );
};

export default LandingNav;
