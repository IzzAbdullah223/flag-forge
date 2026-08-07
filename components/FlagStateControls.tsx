"use client";

import { useState } from "react";
import { Zap, PowerOff } from "lucide-react";

type FlagStateControlsProps = {
  environmentId: string;
  initialEnabled: boolean;
  initialRolloutPercent: number;
};

export default function FlagStateControls({
  environmentId,
  initialEnabled,
  initialRolloutPercent,
}: FlagStateControlsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [rollout, setRollout] = useState(initialRolloutPercent);

  return (
    <div className="flex flex-col gap-5">
      <input type="hidden" name="environmentId" value={environmentId} />
      <input type="hidden" name="enabled" value={enabled ? "on" : ""} />
      <input type="hidden" name="rolloutPercent" value={rollout} />

      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className="flex items-center gap-2 self-start px-4 py-2 rounded-full text-sm font-medium transition-all"
        style={{
          background: enabled ? "rgba(62, 207, 142, 0.12)" : "rgba(240, 100, 100, 0.1)",
          color: enabled ? "var(--signal-green)" : "#F06464",
          boxShadow: enabled
            ? "0 0 12px rgba(62, 207, 142, 0.45), 0 0 2px rgba(62, 207, 142, 0.6)"
            : "0 0 12px rgba(240, 100, 100, 0.3), 0 0 2px rgba(240, 100, 100, 0.5)",
        }}
      >
        {enabled ? <Zap size={14} fill="currentColor" /> : <PowerOff size={14} />}
        {enabled ? "Enabled" : "Disabled"}
      </button>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-muted)]">Rollout</span>
          <span className="font-mono-key text-sm">{rollout}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={rollout}
          onChange={(e) => setRollout(Number(e.target.value))}
          className="w-full accent-[var(--signal-amber)]"
        />
      </div>
    </div>
  );
}