"use client";

import { useUser, SignUp } from "@clerk/nextjs";
import Link from "next/link";

const SignUpPage = () => {
  const isSignedIn = useUser();

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-amber-200 dark:from-blue-800 dark:to-transparent px-4">
        <div className="w-full max-w-md glass p-8 rounded-2xl shadow-xl text-center flex flex-col items-center animate-fade-in relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 to-purple-600"></div>

          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <div className="relative w-20 h-20 bg-linear-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-inner flex items-center justify-center text-4xl border border-white/50 dark:border-white/10">
              👋
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Welcome Back!
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-sm">
            You are already signed in to your account. Ready to continue your IELTS preparation?
          </p>

          <Link href="/dashboard" className="w-full">
            <button className="group w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2">
              Go to Dashboard
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 transition-transform group-hover:translate-x-1">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-orange-400 to-amber-600 dark:from-blue-800 dark:to-transparent px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            IELTS <span className="gradient-text"> Prep Pro</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to continue your learning journey</p>
              </div>
              <SignUp
                        appearance={{
            elements: {
              formButtonPrimary: 
                'bg-primary hover:bg-primary/90 text-white',
              card: 'shadow-xl rounded-2xl',
              headerTitle: 'text-2xl font-bold',
              headerSubtitle: 'text-gray-600 dark:text-gray-400',
              socialButtonsBlockButton: 
                'border-2 hover:bg-gray-50 dark:hover:bg-gray-800',
              formFieldInput: 
                'rounded-lg border-gray-300 dark:border-gray-700',
              footerActionLink: 
                'text-primary hover:text-primary/80',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
};

export default SignUpPage;
