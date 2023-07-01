import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogOverlay,
} from 'solid-headless';
import classNames from 'classnames';
import { Portal } from 'solid-js/web';

import { useModalContext } from '~/context/ModalContext';

const Content = (props) => {
  const { isOpen, setIsOpen } = useModalContext();

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <Portal>
      <Transition
        appear
        show={isOpen()}
      >
        <Dialog
          isOpen
          class="fixed inset-0 z-30 overflow-y-auto"
          onClose={closeModal}
        >
          <div class="h-full flex items-center justify-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <DialogOverlay class="fixed inset-0 bg-background-dark bg-opacity-50" />
            </TransitionChild>

            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel class={classNames(
                'w-full max-w-md px-8 py-6 overflow-hidden transition-all transform',
                'bg-background dark:bg-background-dark-accent shadow-xl rounded-2xl',
              )}>
                {props.children({ closeModal })}
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </Portal>
  );
};

export default Content;
