import { createEffect, createSignal } from 'solid-js';

const useLocalStorage = (key, initialValue) => {
  let defaultValue;

  try {
    const item = window.localStorage.getItem(key);
    defaultValue = item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(error);
    defaultValue = initialValue;
  }

  const [value, setValue] = createSignal(defaultValue);

  createEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value()));
    } catch (error) {
      console.log(error);
    }
  });

  return [value, setValue];
};

export default useLocalStorage;
