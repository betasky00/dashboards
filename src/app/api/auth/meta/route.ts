import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureOwner } from "@/lib/owner";
import { originFrom } from "@/lib/origin";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }
  await ensureOwner();

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: `${originFrom(req)}/api/auth/meta/callback`,
    scope: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_insights",
      "business_management",
    ].join(","),
    response_type: "code",
    state: session.user.id,
  });

  return NextResponse.redirect(
    `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
  );
}
