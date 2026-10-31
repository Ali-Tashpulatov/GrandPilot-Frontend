import clsx from 'clsx';
import { useLanguage } from '@/hooks/useLanguage';

type StatusBadgeType = 'priority' | 'status';

interface StatusBadgeProps {
  type: StatusBadgeType;
  value: string;
}

const priorityClasses: Record<string, string> = {
  p0: 'badge-p1',
  p1: 'badge-p2',
  p2: 'badge-p3',
  p3: 'badge-p4',
};

const statusClasses: Record<string, string> = {
  new: 'badge-new',
  processing: 'badge-processing',
  ai_resolved: 'badge-resolved',
  escalated: 'badge-escalated',
  closed: 'badge bg-brand-text-secondary/10 text-brand-text-secondary',
};

export default function StatusBadge({ type, value }: StatusBadgeProps) {
  const { t } = useLanguage();

  const valKey = value?.toLowerCase() || '';
  const label =
    type === 'priority'
      ? t(`priority.${valKey}`) !== `priority.${valKey}`
        ? t(`priority.${valKey}`)
        : value.toUpperCase()
      : t(`status.${valKey}`) !== `status.${valKey}`
        ? t(`status.${valKey}`)
        : value;

  const badgeClass =
    type === 'priority'
      ? priorityClasses[value] ?? 'badge'
      : statusClasses[value] ?? 'badge';

  return (
    <span className={clsx(badgeClass, 'select-none whitespace-nowrap')}>
      {label}
    </span>
  );
}
