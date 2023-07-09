import { Component, JSX } from 'solid-js';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary';
  shape?: 'circle';
}

const Button: Component<ButtonProps> = (props) => {
  return (
    <button
      {...props}
      type="button"
      // TODO button looses focus when clicked
      disabled={props.disabled || props.loading}
      class={twMerge(
        'px-4 py-2 rounded-md shadow-md transition-colors duration-150',
        'bg-primary text-bgfg-100',
        'hover:bg-primary-600 hover:text-bgfg-100',
        'disabled:bg-bgfg-700',
        props.variant === 'secondary' && 'bg-bgfg-200 text-bgfg-700 dark:bg-bgfg-700 dark:text-bgfg-100',
        props.variant === 'secondary' && 'hover:bg-bgfg-700 dark:hover:bg-bgfg-200 dark:hover:text-bgfg-700',
        props.variant === 'tertiary' && 'bg-transparent text-black dark:text-white hover:bg-bgfg-800',
        props.active && 'bg-primary-700 hover:bg-primary-700',
        props.loading && 'animate-pulse',
        props.shape === 'circle' && 'rounded-full aspect-square',
        props.class,
      )}
      />
  );
};

export default Button;
