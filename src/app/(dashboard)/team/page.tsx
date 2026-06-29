"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Trash2, Loader2, Check, KeyRound } from "lucide-react";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "@/components/ui/SocialIcons";

interface Account { id: string; platform: string; username: string; displayName?: string | null }
interface Member { id: string; username: string; name?: string | null; accountIds: string[] }

function Glyph({ platform }: { platform: string }) {
  if (platform === "instagram") return <InstagramIcon className="w-3.5 h-3.5" style={{ color: "#1c1a17" }} />;
  if (platform === "facebook") return <FacebookIcon className="w-3.5 h-3.5" style={{ color: "#1c1a17" }} />;
  return <TikTokIcon className="w-3.5 h-3.5 fill-[#1c1a17]" />;
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [forbidden, setForbidden] = useState(false);

  // new member form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    const [mRes, aRes] = await Promise.all([fetch("/api/team"), fetch("/api/analytics")]);
    if (mRes.status === 403) { setForbidden(true); return; }
    setMembers(mRes.ok ? await mRes.json() : []);
    setAccounts(aRes.ok ? await aRes.json() : []);
  };

  useEffect(() => { load(); }, []);

  const toggle = (id: string, arr: string[], set: (v: string[]) => void) =>
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const create = async () => {
    setCreating(true);
    setNotice(null);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, name, accountIds: picked }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.error) { setNotice(data.error); return; }
    setNotice(`Created “${username}”. Send them their username + password.`);
    setUsername(""); setPassword(""); setName(""); setPicked([]);
    load();
  };

  const setAccess = async (member: Member, accountId: string) => {
    const next = member.accountIds.includes(accountId)
      ? member.accountIds.filter((x) => x !== accountId)
      : [...member.accountIds, accountId];
    setMembers((ms) => ms?.map((m) => (m.id === member.id ? { ...m, accountIds: next } : m)) ?? ms);
    await fetch(`/api/team/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountIds: next }),
    });
  };

  const resetPassword = async (member: Member) => {
    const pw = prompt(`New password for ${member.username}:`);
    if (!pw) return;
    await fetch(`/api/team/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    alert("Password updated. Send it to your team member.");
  };

  const remove = async (member: Member) => {
    if (!confirm(`Remove ${member.username}?`)) return;
    await fetch(`/api/team/${member.id}`, { method: "DELETE" });
    load();
  };

  if (forbidden) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-[#f4f1ea] border border-[#dbd4c7] rounded-xl p-8 text-center">
          <p className="text-sm font-medium text-[#1c1a17]">Admins only</p>
          <p className="text-xs text-[#857f74] mt-1">Only the workspace admin can manage the team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-[#1c1a17]" />
        <div>
          <h1 className="text-2xl font-semibold text-[#1c1a17]">Team</h1>
          <p className="text-[#6b655b] text-sm mt-0.5">
            Create logins for your team and choose which accounts each person can see.
          </p>
        </div>
      </div>

      {/* Create member */}
      <div className="bg-[#f4f1ea] border border-[#dbd4c7] rounded-xl p-5 space-y-3">
        <p className="text-sm font-semibold text-[#1c1a17]">Add a team member</p>
        <div className="grid grid-cols-3 gap-3">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className="bg-[#efeae1] border border-[#d4ccbd] rounded-lg px-3 py-2 text-sm text-[#1c1a17] placeholder-[#a39c8d] outline-none focus:border-[#1c1a17]/50" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" className="bg-[#efeae1] border border-[#d4ccbd] rounded-lg px-3 py-2 text-sm text-[#1c1a17] placeholder-[#a39c8d] outline-none focus:border-[#1c1a17]/50" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="display name (optional)" className="bg-[#efeae1] border border-[#d4ccbd] rounded-lg px-3 py-2 text-sm text-[#1c1a17] placeholder-[#a39c8d] outline-none focus:border-[#1c1a17]/50" />
        </div>
        <div>
          <p className="text-xs text-[#6b655b] mb-1.5">Accounts they can access</p>
          {accounts.length === 0 ? (
            <p className="text-xs text-[#a39c8d]">Connect accounts first (Accounts page).</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {accounts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => toggle(a.id, picked, setPicked)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${picked.includes(a.id) ? "bg-[#1c1a17] text-[#f7f3ec] border-transparent" : "border-[#c4bbab] text-[#1c1a17] hover:border-[#1c1a17]/40"}`}
                >
                  <span className={picked.includes(a.id) ? "opacity-0 w-0" : ""}><Glyph platform={a.platform} /></span>
                  @{a.username}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={create}
          disabled={creating || !username || !password}
          className="flex items-center gap-2 bg-[#1c1a17] hover:bg-[#000000] disabled:opacity-50 text-[#f7f3ec] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create member
        </button>
        {notice && <p className="text-xs text-[#46413a]">{notice}</p>}
      </div>

      {/* Members list */}
      <div>
        <h2 className="text-sm font-semibold text-[#1c1a17] mb-3">Members</h2>
        {members === null ? (
          <div className="bg-[#f4f1ea] border border-[#dbd4c7] rounded-xl p-6 text-sm text-[#857f74]">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Loading…
          </div>
        ) : members.length === 0 ? (
          <div className="bg-[#f4f1ea] border border-[#dbd4c7] rounded-xl p-6 text-sm text-[#857f74]">
            No team members yet.
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="bg-[#f4f1ea] border border-[#dbd4c7] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-[#1c1a17]">{m.name || m.username}</p>
                    <p className="text-xs text-[#857f74]">@{m.username}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => resetPassword(m)} className="text-[#857f74] hover:text-[#1c1a17] flex items-center gap-1 text-xs">
                      <KeyRound className="w-3.5 h-3.5" /> Reset password
                    </button>
                    <button onClick={() => remove(m)} className="text-[#a39c8d] hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#6b655b] mb-1.5">Can access:</p>
                <div className="flex flex-wrap gap-2">
                  {accounts.map((a) => {
                    const on = m.accountIds.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        onClick={() => setAccess(m, a.id)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${on ? "bg-[#1c1a17] text-[#f7f3ec] border-transparent" : "border-[#c4bbab] text-[#6b655b] hover:border-[#1c1a17]/40"}`}
                      >
                        {on && <Check className="w-3 h-3" />}
                        @{a.username}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
