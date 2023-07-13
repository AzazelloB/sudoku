import { ParentComponent } from 'solid-js';
import {
  PopoverContent,
} from '@ark-ui/solid/popover';
import { usePopover } from '@ark-ui/solid/popover/use-popover';
import { twMerge } from 'tailwind-merge';

import Transition from '~/ui/Transition';

interface ContentProps {
  class?: string;
}

const Content: ParentComponent<ContentProps> = (props) => {
  const popoverProps = usePopover();

  return (
    <>
      <Transition
        show={popoverProps().isOpen}
        enter="transition duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverContent
          class={twMerge(
            'absolute right-0 mt-1 z-50 w-max max-w-sm px-4 py-2',
            'bg-bgfg-200 dark:bg-bgfg-800 text-bgfg-800 dark:text-bgfg-100 rounded-md shadow-md',
            props.class,
          )}
        >
          {props.children}
        </PopoverContent>
      </Transition>
    </>
  );
};

export default Content;
