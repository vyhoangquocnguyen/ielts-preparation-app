import Header from "@/components/dashboard/header";
import SideBar from "@/components/dashboard/sideBar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <SideBar />

      <div className="lg:pl-64">
        {/* Header */}
        <Header />

        {/* Content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
