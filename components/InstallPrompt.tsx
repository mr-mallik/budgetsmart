"use client";

import { useEffect, useState } from "react";
import { Share, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadInstallDismissed, saveInstallDismissed } from "@/lib/storage";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type Platform = "android" | "ios" | null;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const navStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return window.matchMedia("(display-mode: standalone)").matches || navStandalone === true;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function initialPlatform(): Platform {
  if (isStandalone() || loadInstallDismissed()) return null;
  return isIOS() ? "ios" : null;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>(() => initialPlatform());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone() || loadInstallDismissed()) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
    }

    function handleAppInstalled() {
      setDismissed(true);
      saveInstallDismissed();
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  function dismiss() {
    setDismissed(true);
    saveInstallDismissed();
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === "accepted") {
      setDismissed(true);
      saveInstallDismissed();
    }
  }

  if (dismissed || !platform) return null;

  return (
    <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300 mb-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Smartphone size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Install BudgetSmart</p>
        {platform === "android" ? (
          <>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add it to your home screen for quick, offline access.
            </p>
            <Button type="button" size="sm" onClick={handleInstall} className="mt-2">
              Install
            </Button>
          </>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tap <Share size={12} className="inline -translate-y-0.5" /> then Add to Home Screen for quick,
            offline access.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-transform active:scale-90"
      >
        <X size={15} />
      </button>
    </div>
  );
}
