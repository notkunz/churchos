import Sidebar from "@/components/Sidebar";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import TrialBanner from "@/components/TrialBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-56 pt-14 md:pt-0">
        <TrialBanner />
        <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>
      </div>
    </div>
  );
}
