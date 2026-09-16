import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

function LoginFormFallback() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
