import { ParentComponent } from 'solid-js';
import { PopoverProvider } from '~/context/PopoverContext';

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
    <PopoverProvider>
      <PopoverInContext>
        {props.children}
      </PopoverInContext>
    </PopoverProvider>
  );
};

Popover.Button = Button;
Popover.Content = Content;

export default Popover;
