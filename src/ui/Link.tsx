import { ParentComponent, ComponentProps } from 'solid-js';
import { Pressable } from '@ark-ui/solid/pressable';
import { twMerge } from 'tailwind-merge';

interface LinkProps extends ComponentProps<typeof Pressable> {
  class?: string;
}

const Link: ParentComponent<LinkProps> = (props) => {
  return (
    <button
      {...props}
      class={twMerge(
        'cursor-pointer underline',
        'hover:brightness-90 active:brightness-110 dark:hover:brightness-125 dark:active:brightness-90',
        props.class,
      )}
    >
      {props.children}
    </button>
  );
};

export default Link;
