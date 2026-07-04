import Sidebar from "@/components/Sidebar";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-56 pt-14 md:pt-0">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}
