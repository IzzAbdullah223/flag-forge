import { History } from "lucide-react";

type AuditLogEntry = {
  id: string;
  action: string;
  targetType: string;
  createdAt: Date;
  user: { name: string; email: string };
};

type AuditLogListProps = {
  entries: AuditLogEntry[];
};

function formatAction(action: string) {
  return action
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AuditLogList({ entries }: AuditLogListProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <History size={16} className="text-[var(--text-muted)]" />
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Recent Activity
        </h2>
      </div>

      {entries.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm">No activity yet.</p>
      ) : (
        <div className="border border-[var(--border)] bg-[var(--panel)] rounded-lg divide-y divide-[var(--border)]">
          {entries.map((entry) => (
            <div key={entry.id} className="px-4 py-3 text-sm">
              <p>
                <span className="font-medium">{entry.user.name || entry.user.email}</span>
                <span className="text-[var(--text-muted)]"> {formatAction(entry.action).toLowerCase()}</span>
              </p>
              <p className="font-mono-key text-xs text-[var(--text-muted)] mt-0.5">{entry.targetType}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{timeAgo(entry.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}