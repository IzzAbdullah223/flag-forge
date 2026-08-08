"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type ConfirmDeleteButtonProps = {
  label: string;
  itemName: string;
  onDelete: () => Promise<void>;
  redirectTo?: string;
};

export default function ConfirmDeleteButton({
  label,
  itemName,
  onDelete,
  redirectTo,
}: ConfirmDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await onDelete();
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[var(--text-muted)]">Delete "{itemName}"?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-[#F06464] hover:underline disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[#F06464] transition-colors"
    >
      <Trash2 size={12} />
      {label}
    </button>
  );
}