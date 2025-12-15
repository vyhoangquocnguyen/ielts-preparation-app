"use client";
import { Bars3Icon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import MobileSidebar from "./mobileSidebar";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Toggle } from "../ui/toggle";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function ModeToggle() {
    const { theme, setTheme } = useTheme();
    return (
      <Toggle onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      </Toggle>
    );
  }
  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200  bg-white dark:bg-gray-900 dark:border-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Button for menu on phone */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="-ml-0.5 rounded-md p-2 lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors">
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="size-6" aria-hidden="true" />
        </button>

        {/* Spacer */}
        <div className="flex flex-1 self-stretch lg:gap-x-">
          <div className="flex flex-1 items-center justify-center">
            {/* Search */}
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Theme toggle button */}
            {/* <ModeToggle /> */}
            {/* User Menu from Clerk */}
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox:
                    "h-10 w-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-primary transition-all",
                  userButtonPopoverCard: "shadow-xl",
                },
              }}
            />
          </div>
        </div>
      </header>
      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => {
          setMobileMenuOpen(false);
        }}
      />
    </>
  );
};

export default Header;
