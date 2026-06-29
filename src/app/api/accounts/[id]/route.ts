import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }
  const { id } = await params;

  // Only allow deleting accounts that belong to the owner's businesses.
  const account = await db.socialAccount.findFirst({
    where: { id, business: { userId: session.user.id } },
  });
  if (!account) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.socialAccount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
