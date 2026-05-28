import { registerUser } from "@/lib/actions";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-orange-900">Registrierung</h1>
      <form action={registerUser} className="mt-4 space-y-3">
        <input name="username" required placeholder="Benutzername" className="w-full rounded-xl border border-orange-200 px-3 py-2" />
        <input name="email" type="email" required placeholder="E-Mail" className="w-full rounded-xl border border-orange-200 px-3 py-2" />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Passwort (mind. 8 Zeichen)"
          className="w-full rounded-xl border border-orange-200 px-3 py-2"
        />
        <button className="w-full rounded-xl bg-orange-600 py-2 text-white">Konto anlegen</button>
      </form>
    </div>
  );
}
