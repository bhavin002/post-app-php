"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/src/context/AuthContext";

import { Button } from "@/components/ui/button";

export default function Navbar() {
  const router = useRouter();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link
          href="/posts"
          className="font-bold text-xl"
        >
          PostApp
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.name}
          </span>

          <Button
            variant="outline"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
