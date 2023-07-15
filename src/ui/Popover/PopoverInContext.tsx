import { ParentComponent } from 'solid-js';
import { Popover } from '@ark-ui/solid/popover';

import { usePopoverContext } from '~/context/PopoverContext';

const PopoverInContext: ParentComponent = (props) => {
  const { open, setOpen } = usePopoverContext();

  return (
    <Popover
      open={open()}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    >
      {props.children}
    </Popover>
  );
};

export default PopoverInContext;
