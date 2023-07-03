import { Accessor, createEffect, createSignal, on, onCleanup } from 'solid-js';

function useDebounce<T>(value: Accessor<T>, delay: number) {
  const [debouncedValue, setDebouncedValue] = createSignal<T>(value());

  createEffect(on(value, (newValue) => {
    const timeout = setTimeout(() => {
      setDebouncedValue(() => newValue);
    }, delay);

    onCleanup(() => {
      clearTimeout(timeout);
    });
  }));

  return debouncedValue;
}

export default useDebounce;
