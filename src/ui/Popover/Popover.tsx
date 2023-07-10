import { ParentComponent } from 'solid-js';
import {
  Popover as HeadlessPopover,
} from 'solid-headless';
import { twMerge } from 'tailwind-merge';

import Button from '~/ui/Popover/Button';
import Content from '~/ui/Popover/Content';
import PopoverInContext from '~/ui/Popover/PopoverInContext';

interface PopoverComponent {
  Button: typeof Button;
  Content: typeof Content;
}

interface PopoverProps {
  class?: string;
}

const Popover: ParentComponent<PopoverProps> & PopoverComponent = (props) => {
  return (
    <HeadlessPopover defaultOpen={false} class={twMerge('relative', props.class)}>
      <PopoverInContext>
        {props.children}
      </PopoverInContext>
    </HeadlessPopover>
  );
};

Popover.Button = Button;
Popover.Content = Content;

export default Popover;
