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

// Update a member: which accounts they can access, and/or reset password.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const { accountIds, password, name } = await req.json();

  const member = await db.user.findFirst({ where: { id, role: "member" } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (Array.isArray(accountIds)) {
    // Replace the access set.
    await db.accountAccess.deleteMany({ where: { userId: id } });
    await db.accountAccess.createMany({
      data: accountIds.map((sid: string) => ({ userId: id, socialAccountId: sid })),
      skipDuplicates: true,
    });
  }
  if (password) {
    await db.user.update({ where: { id }, data: { passwordHash: hashPassword(String(password)) } });
  }
  if (typeof name === "string") {
    await db.user.update({ where: { id }, data: { name } });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await db.user.deleteMany({ where: { id, role: "member" } });
  return NextResponse.json({ ok: true });
}
