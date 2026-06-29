import { db } from "@/lib/db";

// Returns the social accounts a session may see:
//   admin  → every account in the workspace
//   member → only the accounts explicitly granted via AccountAccess
export async function accessibleAccounts(userId: string, role: string) {
  if (role === "admin") {
    return db.socialAccount.findMany({ orderBy: { createdAt: "asc" } });
  }
  return db.socialAccount.findMany({
    where: { access: { some: { userId } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function canAccessAccount(userId: string, role: string, accountId: string) {
  if (role === "admin") return true;
  const row = await db.accountAccess.findUnique({
    where: { userId_socialAccountId: { userId, socialAccountId: accountId } },
  });
  return !!row;
}
