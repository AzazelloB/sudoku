import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { useRegisterSW } from 'virtual:pwa-register/solid';
import Button from '~/ui/Button';

const intervalMS = 60 * 60 * 1000;

const ReloadPrompt: Component = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
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

    onOfflineReady() {
      setOfflineReady(true);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <Show when={offlineReady() || needRefresh()}>
      <div class="fixed top-0 z-50 flex w-full items-center justify-between bg-bgfg-200 px-8 py-6 dark:bg-bgfg-800">
        <Show
          fallback={<span>New content available, click on reload button to update.</span>}
          when={offlineReady()}
        >
          <span>App ready to work offline</span>
        </Show>

        <Show when={needRefresh()}>
          <Button onClick={() => updateServiceWorker(true)}>Reload</Button>
        </Show>

        <Button
          variant="secondary"
          onClick={close}
        >
          Close
        </Button>
      </div>
   </Show>
  );
};

export default ReloadPrompt;
