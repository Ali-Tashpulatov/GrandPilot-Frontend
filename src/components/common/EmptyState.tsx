import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-10 px-6 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-border-subtle/30">
        <Icon className="h-6 w-6 text-brand-text-muted" strokeWidth={1.5} />
      </div>
      <h3 className="mb-1.5 text-lg font-semibold text-brand-text-secondary">
        {title}
      </h3>
      <p className="max-w-sm text-sm leading-relaxed text-brand-text-muted">
        {description}
      </p>
    </motion.div>
  );
}
