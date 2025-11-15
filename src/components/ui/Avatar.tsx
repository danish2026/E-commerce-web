import clsx from 'clsx';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
};

export const Avatar = ({ src, name, size = 'md' }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return src ? (
    <img
      src={src}
      alt={name}
      className={clsx('rounded-full object-cover shadow-card', sizeClass[size])}
      loading="lazy"
    />
  ) : (
    <span
      aria-hidden
      className={clsx(
        'inline-flex items-center justify-center rounded-full bg-brand/20 text-brand font-semibold',
        sizeClass[size],
      )}
    >
      {initials}
    </span>
  );
};

export default Avatar;

