import React from "react";

const LandingFooter = () => {
  return (
    <footer className="py-8 px-4 border-t border-indigo-500/10 bg-slate-950/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} IELTS Prep AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default LandingFooter;
