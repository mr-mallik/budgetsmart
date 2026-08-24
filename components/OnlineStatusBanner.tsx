"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OnlineStatusBanner() {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300 flex items-center justify-center gap-2 bg-foreground px-4 py-2 text-xs font-medium text-background">
      <WifiOff size={13} />
      Offline. Your data is safe and saved on this device.
    </div>
  );
}
