import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useLanguage } from '@/hooks/useLanguage';

export default function ConnectionIndicator() {
  const { status } = useConnectionStatus();
  const { t } = useLanguage();

  const dotColor = {
    connected: 'bg-brand-success',
    disconnected: 'bg-brand-danger',
    checking: 'bg-brand-warning',
  }[status];

  const label = {
    connected: t('general.live'),
    disconnected: t('general.demo'),
    checking: t('general.checking'),
  }[status];

  const pillBg = {
    connected: 'bg-brand-success/10 border-brand-success/20',
    disconnected: 'bg-brand-danger/10 border-brand-danger/20',
    checking: 'bg-brand-warning/10 border-brand-warning/20',
  }[status];

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium select-none',
        pillBg,
      )}
    >
      <span className="relative flex h-2 w-2">
        {status === 'checking' && (
          <motion.span
            className={clsx('absolute inline-flex h-full w-full rounded-full opacity-75', dotColor)}
            animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span className={clsx('relative inline-flex h-2 w-2 rounded-full', dotColor)} />
      </span>
      <span
        className={clsx({
          'text-brand-success': status === 'connected',
          'text-brand-danger': status === 'disconnected',
          'text-brand-warning': status === 'checking',
        })}
      >
        {label}
      </span>
    </div>
  );
}
