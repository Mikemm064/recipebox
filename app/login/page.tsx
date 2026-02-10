"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });

          if (!response.ok) {
            const data = (await response.json().catch(() => ({ error: "Login failed" }))) as { error?: string };
            setError(data.error ?? "Login failed");
            return;
          }

          window.location.href = returnTo;
        }}
      >
        <h1 className="text-xl font-semibold">RecipeBox Login</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your app password.</p>
        <input type="password" className="mt-4 w-full" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button className="mt-4 w-full bg-slate-900 text-white">Sign in</button>
      </form>
    </main>
  );
}
