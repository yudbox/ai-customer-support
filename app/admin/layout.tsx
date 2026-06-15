import { AdminNav } from "@/app/_components/AdminNav";

export const metadata = {
  title: "Analytics — AI Customer Support",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          System metrics and configuration
        </p>
      </div>
      <AdminNav />
      <div className="flex-1 bg-gray-50">{children}</div>
    </div>
  );
}
