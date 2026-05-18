import clsx from 'clsx';

const toneMap = {
  orange: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  neutral: 'bg-white/10 text-gray-200 border-white/15'
};

export default function Badge({ children, tone = 'neutral' }) {
  return <span className={clsx('inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]', toneMap[tone])}>{children}</span>;
}