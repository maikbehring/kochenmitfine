"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState("");

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
          setError("Login fehlgeschlagen.");
          return;
        }
        window.location.href = "/";
      }}
    >
      <input name="email" type="email" required placeholder="E-Mail" className="w-full rounded-xl border border-orange-200 px-3 py-2" />
      <input name="password" type="password" required placeholder="Passwort" className="w-full rounded-xl border border-orange-200 px-3 py-2" />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="w-full rounded-xl bg-orange-600 py-2 text-white">Einloggen</button>
    </form>
  );
}
