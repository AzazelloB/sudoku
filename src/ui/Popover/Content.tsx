import { ParentComponent } from 'solid-js';
import {
  PopoverContent, PopoverPositioner,
} from '@ark-ui/solid/popover';
import { twMerge } from 'tailwind-merge';

import Transition from '~/ui/Transition';

interface ContentProps {
  class?: string;
}

const Content: ParentComponent<ContentProps> = (props) => {
  return (
    <Transition>
      <PopoverPositioner>
        <PopoverContent
          class={twMerge(
            'absolute right-0 mt-1 z-50 w-max max-w-sm px-4 py-2',
            'bg-bgfg-200 dark:bg-bgfg-800 text-bgfg-800 dark:text-bgfg-100 rounded-md shadow-md',
            props.class,
          )}
        >
          {props.children}
        </PopoverContent>
      </PopoverPositioner>
    </Transition>
  );
};

export default Content;
