import { ParentComponent } from 'solid-js';
import {
  Popover as HeadlessPopover,
} from 'solid-headless';

import Button from '~/ui/Popover/Button';
import Content from '~/ui/Popover/Content';
import PopoverInContext from '~/ui/Popover/PopoverInContext';

interface PopoverComponent {
  Button: typeof Button;
  Content: typeof Content;
}

const Popover: ParentComponent & PopoverComponent = (props) => {
  return (
    <HeadlessPopover defaultOpen={false} class="relative">
      <PopoverInContext>
        {props.children}
      </PopoverInContext>
    </HeadlessPopover>
  );
};

Popover.Button = Button;
Popover.Content = Content;

export default Popover;
