import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

// List team members + which accounts each can access.
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const members = await db.user.findMany({
    where: { role: "member" },
    include: { accountAccess: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      username: m.username,
      name: m.name,
      accountIds: m.accountAccess.map((a) => a.socialAccountId),
    }))
  );
}

// Create a team member with a username/password and account access.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { username, password, name, accountIds } = await req.json();
  const uname = String(username ?? "").trim().toLowerCase();
  if (!uname || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }
  if (uname === (process.env.ADMIN_USERNAME || "admin")) {
    return NextResponse.json({ error: "That username is reserved" }, { status: 400 });
  }
  const existing = await db.user.findUnique({ where: { username: uname } });
  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 400 });
  }

  const user = await db.user.create({
    data: {
      username: uname,
      name: name || uname,
      role: "member",
      passwordHash: hashPassword(String(password)),
      accountAccess: {
        create: (accountIds ?? []).map((id: string) => ({ socialAccountId: id })),
      },
    },
    include: { accountAccess: true },
  });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    name: user.name,
    accountIds: user.accountAccess.map((a) => a.socialAccountId),
  });
}
