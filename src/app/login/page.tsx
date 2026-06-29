"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { username, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect username or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e7e1d6] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-md bg-[#1c1a17] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#f7f3ec]" />
          </div>
          <span className="font-semibold text-[#1c1a17] text-lg tracking-tight">Orbit</span>
        </div>

        <form onSubmit={submit} className="bg-[#f4f1ea] border border-[#dbd4c7] rounded-2xl p-6">
          <h1 className="text-lg font-semibold text-[#1c1a17]">Welcome back</h1>
          <p className="text-sm text-[#857f74] mt-0.5 mb-5">Sign in to your workspace</p>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full bg-[#efeae1] border border-[#d4ccbd] rounded-lg px-3 py-2.5 text-sm text-[#1c1a17] placeholder-[#a39c8d] outline-none focus:border-[#1c1a17]/50 mb-2"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-[#efeae1] border border-[#d4ccbd] rounded-lg px-3 py-2.5 text-sm text-[#1c1a17] placeholder-[#a39c8d] outline-none focus:border-[#1c1a17]/50"
          />

          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password || !username}
            className="mt-4 w-full bg-[#1c1a17] hover:bg-[#000000] disabled:opacity-50 text-[#f7f3ec] py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-[#a39c8d] mt-4">
          Use the credentials your workspace admin gave you
        </p>
      </div>
    </div>
  );
}
