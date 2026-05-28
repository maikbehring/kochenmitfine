import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await getAuthSession();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-orange-900">Login</h1>
      <LoginForm />
    </div>
  );
}
