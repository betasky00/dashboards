import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInstagramStats, getFacebookStats } from "@/lib/meta";
import { accessibleAccounts } from "@/lib/access";

export const dynamic = "force-dynamic";

// Live stats for the accounts this user may see, pulled from Meta on demand.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let accounts;
  try {
    accounts = await accessibleAccounts(session.user.id, session.user.role);
  } catch {
    // DB not reachable yet — return empty so the UI shows a clean empty state.
    return NextResponse.json([]);
  }

  const results = await Promise.all(
    accounts.map(async (a) => {
      const base = {
        id: a.id,
        platform: a.platform,
        username: a.username,
        displayName: a.displayName,
      };
      try {
        if (a.platform === "instagram") {
          const s = await getInstagramStats(a.accountId, a.accessToken);
          return { ...base, ...s };
        }
        if (a.platform === "facebook") {
          const s = await getFacebookStats(a.accountId, a.accessToken);
          return { ...base, ...s };
        }
        return { ...base, followers: 0, mediaCount: 0, reach: null };
      } catch (err) {
        return {
          ...base,
          followers: null,
          mediaCount: null,
          reach: null,
          error: err instanceof Error ? err.message : "Failed to load stats",
        };
      }
    })
  );

  return NextResponse.json(results);
}
