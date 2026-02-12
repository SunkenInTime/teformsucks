"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSoundMuted, setSoundMuted } from "@/lib/sound";

type SoundToggleProps = {
  onToggle?: (muted: boolean) => void;
};

export function SoundToggle({ onToggle }: SoundToggleProps) {
  const [muted, setMuted] = React.useState(false);

  React.useEffect(() => {
    setMuted(getSoundMuted());
  }, []);

  const handleToggle = () => {
    setMuted((prev) => {
      const next = !prev;
      setSoundMuted(next);
      onToggle?.(next);
      return next;
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  );
}
