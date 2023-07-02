import { createSignal } from 'solid-js';

import { createContext } from '~/utils/createContext';

function useModalState() {
  const [isOpen, setIsOpen] = createSignal(false);

  return {
    isOpen,
    setIsOpen,
  };
}

const [ModalProvider, useModalContext] = createContext(useModalState);

export { ModalProvider, useModalContext };
