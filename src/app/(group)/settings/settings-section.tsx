import type { LucideIcon } from 'lucide-react';

export function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className='rounded-panel bg-surface p-6 shadow-card sm:p-8'>
      <div className='flex items-start gap-4'>
        <span
          aria-hidden
          className='grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-3 text-ink'>
          <Icon className='size-5' strokeWidth={2.25} />
        </span>
        <div className='min-w-0 pt-0.5'>
          <h2 id={id} className='text-xl leading-tight font-bold tracking-tight'>
            {title}
          </h2>
          <p className='mt-1 text-sm font-semibold text-ink-2'>{description}</p>
        </div>
      </div>
      <div className='mt-6'>{children}</div>
    </section>
  );
}
