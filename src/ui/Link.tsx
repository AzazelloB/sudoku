import { ParentComponent, JSX } from 'solid-js';
import { twMerge } from 'tailwind-merge';

interface LinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  class?: string;
}

const Link: ParentComponent<LinkProps> = (props) => {
  return (
    <a
      {...props}
      class={twMerge(
        'cursor-pointer underline',
        'hover:brightness-125 active:brightness-90',
        props.class,
      )}
    >
      {props.children}
    </a>
  );
};

export default Link;
