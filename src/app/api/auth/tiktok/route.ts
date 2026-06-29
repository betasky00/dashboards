import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTikTokOAuthUrl } from "@/lib/tiktok";
import { ensureOwner } from "@/lib/owner";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }
  // Make sure the owner User row exists so the callback can attach the account.
  await ensureOwner();
  return NextResponse.redirect(getTikTokOAuthUrl(session.user.id));
}
