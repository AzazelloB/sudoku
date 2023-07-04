import { Accessor, Setter, createSignal } from 'solid-js';

import { createContext } from '~/utils/createContext';

interface Params {
  open?: Accessor<boolean>;
  setOpen?: Setter<boolean>;
}

function useModalState(props: Params) {
  if (props.open !== undefined && props.setOpen !== undefined) {
    return props as Required<Params>;
  }

  const [open, setOpen] = createSignal(false);

  return {
    open,
    setOpen,
  };
}

const [ModalProvider, useModalContext] = createContext(useModalState);

export { ModalProvider, useModalContext };
