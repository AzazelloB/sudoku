import {
  Accessor, createEffect, onCleanup,
} from 'solid-js';

type Handler = (event: Event) => void;

function useClickOutside(ref: Accessor<HTMLElement | null>, handler: Handler) {
  createEffect(() => {
    const listener = (event: Event) => {
      if (!ref() || ref()?.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    onCleanup(() => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    });
  });
}

export default useClickOutside;
