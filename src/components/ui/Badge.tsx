interface BadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Ready: 'bg-teal-100 text-teal-800',
  Delivered: 'bg-green-100 text-green-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-600',
  Default: 'bg-gray-100 text-gray-700',
};

export function StatusBadge({ status, className = '' }: BadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Default;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style} ${className}`}
    >
      {status}
    </span>
  );
}
