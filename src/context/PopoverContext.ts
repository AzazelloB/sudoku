import {
  createSignal,
} from 'solid-js';

import { createContext } from '~/utils/createContext';

function usePopoverState() {
  const [open, setOpen] = createSignal(false);

  return {
    open,
    setOpen,
  };
}

const [PopoverProvider, usePopoverContext] = createContext(usePopoverState);

export { PopoverProvider, usePopoverContext };
