import { Component, JSX } from 'solid-js';
import { twMerge } from 'tailwind-merge';

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;

const Input: Component<InputProps> = (props) => {
  return (
    <input
      {...props}
      class={twMerge(
        'w-full p-2.5 text-base rounded-lg border',
        'placeholder:text-bgfg-400',
        'bg-bgfg-200 border-bgfg-400 text-bgfg-900',
        'dark:bg-bgfg-700 dark:border-bgfg-500 dark:text-bgfg-100',
        'focus-visible:outline-none focus-visible:ring-1',
        'focus-visible:ring-bgfg-900 focus-visible:ring-offset-bgfg-100',
        'dark:focus-visible:ring-bgfg-100 dark:focus-visible:ring-offset-bgfg-900',
        props.class,
      )}
    />
  );
};

export default Input;
