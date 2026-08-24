"use client";

import dynamic from "next/dynamic";
import { Wallet } from "lucide-react";

const AppShell = dynamic(() => import("@/components/AppShell"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Wallet size={22} strokeWidth={2.2} />
      </span>
    </div>
  ),
});

export default function Home() {
  return <AppShell />;
}
