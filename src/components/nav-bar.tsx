import Link from "next/link";
import { getAuthSession } from "@/lib/auth";

export async function NavBar() {
  const session = await getAuthSession();

  return (
    <header className="border-b border-orange-100 bg-[#FFFDF8]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold text-orange-800">
          Kochen mit Fine
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {session?.user?.role === "ADMIN" && (
            <>
              <Link href="/admin" className="rounded-full px-4 py-2 hover:bg-orange-50">
                Admin
              </Link>
              <Link href="/admin/comments" className="rounded-full px-4 py-2 hover:bg-orange-50">
                Moderation
              </Link>
            </>
          )}
          {!session?.user ? (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 hover:bg-orange-50">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
              >
                Registrieren
              </Link>
            </>
          ) : (
            <>
              <span className="text-orange-900">{session.user.name}</span>
              <Link
                href="/api/auth/signout"
                className="rounded-full border border-orange-300 px-4 py-2 text-sm hover:bg-orange-50"
              >
                Logout
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
