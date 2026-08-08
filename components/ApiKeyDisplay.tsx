"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type ApiKeyDisplayProps = {
  apiKeyValue: string;
};

export default function ApiKeyDisplay({ apiKeyValue }: ApiKeyDisplayProps) {
  const [revealed, setRevealed] = useState(false);

  const masked = `${apiKeyValue.slice(0, 8)}••••••••${apiKeyValue.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono-key text-xs text-[var(--text-muted)]">
        {revealed ? apiKeyValue : masked}
      </span>
      <button
        type="button"
        onClick={() => setRevealed(!revealed)}
        className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
      >
        {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
}