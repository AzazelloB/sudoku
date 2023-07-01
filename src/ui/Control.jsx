import {
  For,
  Show,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { twMerge } from 'tailwind-merge';

import { subscribe, unsubscribe } from '~/utils/pubSub';

import Button from '~/ui/Button';

import { state } from '~/components/Sudoku/state';

const Control = (props) => {
  const [local, others] = splitProps(props, [
    'as', 'key', 'ctrl', 'shift', 'alt', 'alternatives', 'hintClass', 'corenr',
  ]);

  const [showControls, setShowControls] = createSignal(state.showControls);

  onMount(() => {
    const onShowControls = (show) => {
      setShowControls(show);
    };

    subscribe('showControls', onShowControls);

    onCleanup(() => {
      unsubscribe('showControls', onShowControls);
    });
  });

  const alternatives = () => {
    return [
      {
        key: local.key,
        ctrl: local.ctrl,
        shift: local.shift,
        alt: local.alt,
      },
      ...local.alternatives || [],
    ].filter((shortcut) => shortcut.key);
  };

  return (
    <Dynamic
      component={local.as || Button}
      {...others}
      class={twMerge(
        others.class,
        'relative',
      )}
    >
      {others.children}

      <Show when={showControls()}>
        <div class={twMerge(
          'absolute z-10 px-2 py-1 shadow-md rounded-md',
          'text-xs text-white bg-background-dark-accent',
          local.corenr === 1 && '-top-4 left-2',
          local.corenr === 2 && '-top-4 right-2',
          local.corenr === 3 && '-bottom-4 right-2',
          (local.corenr === 4 || !local.corenr) && '-bottom-4 left-2',
          local.hintClass,
        )}>
          <For each={alternatives()}>
            {(shortcut, i) => (
              <>
                <Show when={shortcut.alt}>
                  Alt&nbsp;+&nbsp;
                </Show>

                <Show when={shortcut.ctrl}>
                  Ctrl&nbsp;+&nbsp;
                </Show>

                <Show when={shortcut.shift}>
                  Shift&nbsp;+&nbsp;
                </Show>

                {shortcut.key}

                <Show when={i() < alternatives().length - 1}>
                  &nbsp;or&nbsp;
                </Show>
              </>
            )}
          </For>
        </div>
      </Show>
    </Dynamic>
  );
};

export default Control;
