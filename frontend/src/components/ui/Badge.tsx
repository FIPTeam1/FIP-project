interface BadgeProps {
  type: 'location' | 'time' | 'serves';
  value: string;
}

const CONFIG = {
  location: { icon: '📍', bg: 'bg-[#E8F4FD]', text: 'text-[#2D7DD2]' },
  time:     { icon: '⏱️', bg: 'bg-[#FEF3E2]', text: 'text-[#D4760A]' },
  serves:   { icon: '👥', bg: 'bg-[#FDE8F0]', text: 'text-[#C2185B]' },
};

export default function Badge({ type, value }: BadgeProps) {
  const { icon, bg, text } = CONFIG[type];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      <span>{icon}</span>
      <span>{value}</span>
    </span>
  );
}
