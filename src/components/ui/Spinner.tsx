interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'current';
}

export function Spinner({ size = 'md', color = 'primary' }: SpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  const colors = {
    primary: 'border-[#5B43EE] border-t-transparent',
    white: 'border-white border-t-transparent',
    current: 'border-current border-t-transparent',
  };
  return (
    <div
      className={`rounded-full border-2 animate-spin ${sizes[size]} ${colors[color]}`}
      role="status"
      aria-label="Loading"
    />
  );
}
