import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get("radora_role")?.value;
  const hasToken = !!cookieStore.get("radora_access_token")?.value;

  if (!hasToken) {
    redirect("/login");
  }

  if (role === "student") redirect("/student-dashboard");
  if (role === "teacher") redirect("/teacher-dashboard");
  if (role === "librarian") redirect("/librarian-dashboard");
  redirect("/dashboard");
}
