"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role === "super_admin") router.replace("/super-admin");
      else router.replace("/dashboard");
    }
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf9ff]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-700 border-t-transparent" />
    </div>
  );
}
