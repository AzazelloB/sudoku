import { createEffect, createSignal } from 'solid-js';
import { createContext } from '~/utils/createContext';

interface Params {
  show: boolean;
}

function useTransitionState(props: Params) {
  const [show, setShow] = createSignal(false);

  createEffect(() => {
    setShow(props.show);
  });

  return {
    show,
    setShow,
  };
}

const [TransitionProvider, useTransitionContext] = createContext(useTransitionState);

export { TransitionProvider, useTransitionContext };
