import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { useRegisterSW } from 'virtual:pwa-register/solid';
import Button from '~/ui/Button';

const intervalMS = 60 * 60 * 1000;

const ReloadPrompt: Component = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (!registration) {
        return;
      }

      setInterval(() => {
        registration.update();
      }, intervalMS);
    },

    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const reload = () => {
    updateServiceWorker(true);
  };

  const close = () => {
    setNeedRefresh(false);
  };

  return (
    <Show when={needRefresh()}>
      <div class="fixed top-0 z-50 flex w-full items-center justify-between bg-bgfg-200 px-8 py-6 dark:bg-bgfg-800">
        <span>New content available, click on reload button to update.</span>

        <div>
          <Button
            class="mr-4"
            onClick={reload}
          >
            Reload
          </Button>

          <Button
            variant="secondary"
            onClick={close}
          >
            Close
          </Button>
        </div>
      </div>
   </Show>
  );
};

export default ReloadPrompt;
