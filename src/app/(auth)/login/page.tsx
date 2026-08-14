import { LoginPage } from "@/features/auth/components/login-page";

export default function Page(props: any) {
  return (
    <div suppressHydrationWarning className="w-full min-h-screen">
      <LoginPage {...props} />
    </div>
  );
}
