import { createSignal } from 'solid-js';

const useLocalStorage = (key, defaultValue) => {
  const initialValue = window.localStorage.getItem(key)
    ? JSON.parse(window.localStorage.getItem(key))
    : defaultValue;

  const [value, setValue] = createSignal(initialValue);

  const setValueAndStore = ((newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.log(error);
    }
  });

  return [value, setValueAndStore];
};

export default useLocalStorage;
