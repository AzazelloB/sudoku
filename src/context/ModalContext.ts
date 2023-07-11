import { useLocation, useNavigate } from '@solidjs/router';
import {
  Accessor,
  Setter,
  createEffect,
  createSignal,
  onMount,
} from 'solid-js';

import { createContext } from '~/utils/createContext';

export interface Params {
  id: string;
  open?: Accessor<boolean>;
  setOpen?: Setter<boolean>;
}

function useModalState(props: Params) {
  const [internalOpen, setInternalOpen] = createSignal(false);

  const location = useLocation();
  const navigate = useNavigate();

  onMount(() => {
    if (props.open !== undefined) {
      setOpen(props.open());
    }
  });

  createEffect(() => {
    if (props.open !== undefined) {
      setInternalOpen(props.open());
    }
  });

  createEffect(() => {
    if (props.setOpen !== undefined) {
      props.setOpen(internalOpen());
    }
  });

  createEffect(() => {
    if (location.hash === `#${props.id}`) {
      setInternalOpen(true);
    } else {
      setInternalOpen(false);
    }
  });

  const setOpen = (value: boolean) => {
    navigate(value ? `#${props.id}` : '', { replace: false });

    setInternalOpen(value);
  };

  return {
    open: internalOpen,
    setOpen,
  };
}

const [ModalProvider, useModalContext] = createContext(useModalState);

export { ModalProvider, useModalContext };
