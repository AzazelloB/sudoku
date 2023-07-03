import { createSignal } from 'solid-js';

const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const initialValue = window.localStorage.getItem(key)
    ? JSON.parse(window.localStorage.getItem(key)!)
    : defaultValue;

  const [value, setValue] = createSignal<T>(initialValue);

  const setValueAndStore = ((newValue: T) => {
    try {
      const strignifiedValue = JSON.stringify(newValue);
      setValue(JSON.parse(strignifiedValue));
      window.localStorage.setItem(key, strignifiedValue);
    } catch (error) {
      console.error(error);
    }
  });

  return [value, setValueAndStore] as const;
};

export default useLocalStorage;
