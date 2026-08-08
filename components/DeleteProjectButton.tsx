"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/actions/project";
import { Trash2 } from "lucide-react";

type DeleteProjectButtonProps = {
  projectId: string;
  projectName: string;
};

export default function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deleteProject(projectId);
      router.push("/dashboard");
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--text-muted)]">Delete "{projectName}"?</span>
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
      className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[#F06464] transition-colors"
    >
      <Trash2 size={14} />
      Delete Project
    </button>
  );
}