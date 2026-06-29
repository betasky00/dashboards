import { Sidebar } from "@/components/dashboard/Sidebar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role ?? "member";
  const username = session?.user?.username;
  const name = session?.user?.name ?? undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} username={username} name={name} />
      <main className="flex-1 overflow-y-auto bg-[#e7e1d6]">{children}</main>
    </div>
  );
}
