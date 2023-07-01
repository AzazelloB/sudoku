import { twMerge } from 'tailwind-merge';

const Button = (props) => {
  return (
    <button
      {...props}
      type="button"
      // TODO button looses focus when clicked
      disabled={props.disabled || props.loading}
      class={twMerge(
        'px-4 py-2 rounded-md transition-colors duration-200',
        'bg-primary text-white',
        'hover:bg-primary-dark hover:text-white disabled:bg-gray-600',
        props.variant === 'tertiary' && 'bg-transparent text-black dark:text-white',
        props.active && 'bg-primary-dark',
        props.loading && 'animate-pulse',
        props.class,
      )}
      />
  );
};

export default Button;
