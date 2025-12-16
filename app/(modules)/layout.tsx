import React from "react";

const ModuleLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-8 animate-fade-in">{children}</div>;
};

export default ModuleLayout;
