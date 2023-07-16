import {
  DialogContent,
  DialogBackdrop,
  DialogContainer,
} from '@ark-ui/solid/dialog';
import { Component, JSX, Ref } from 'solid-js';
import { Portal } from 'solid-js/web';
import { twMerge } from 'tailwind-merge';

import { useModalContext } from '~/context/ModalContext';

import Transition from '~/ui/Transition';

interface ContentProps {
  ref?: Ref<HTMLDivElement>;
  class?: string;
  children: (props: { closeModal: () => void }) => JSX.Element;
}

const Content: Component<ContentProps> = (props) => {
  const { open, setOpen } = useModalContext();

  const closeModal = () => {
    setOpen(false);
  };

  return (
    <Portal ref={props.ref}>
      <Transition
        show={open()}
      >
        <Transition.Child
          class="fixed inset-0 z-50 bg-bgfg-900/50"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop />
        </Transition.Child>

        <DialogContainer
          class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
        >
          <Transition.Child
            class="my-auto"
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogContent class={twMerge(
              'w-full max-w-md px-8 py-6 overflow-hidden transition-all transform',
              'bg-bgfg-100 dark:bg-bgfg-800 shadow-xl rounded-2xl',
              props.class,
            )}>
              {props.children({ closeModal })}
            </DialogContent>
          </Transition.Child>
        </DialogContainer>
      </Transition>
    </Portal>
  );
};

export default Content;
