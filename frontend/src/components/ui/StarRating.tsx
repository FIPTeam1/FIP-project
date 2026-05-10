interface StarRatingProps {
  value: number;
  className?: string;
}

export default function StarRating({ value, className = '' }: StarRatingProps) {
  return (
    <span className={`flex items-center gap-1 ${className}`}>
      <span className="text-primary">★</span>
      <span className="font-semibold text-sm">{value.toFixed(1)}</span>
    </span>
  );
}
