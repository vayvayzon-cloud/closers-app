import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default function CloserLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "closer") redirect("/admin");

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar role="closer" userName={user.name} />
      </div>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
