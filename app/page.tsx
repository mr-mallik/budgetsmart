"use client";

import dynamic from "next/dynamic";

const BudgetApp = dynamic(() => import("@/components/BudgetApp"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  ),
});

export default function Home() {
  return <BudgetApp />;
}
