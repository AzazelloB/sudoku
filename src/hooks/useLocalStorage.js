import { createSignal } from 'solid-js';

const useLocalStorage = (key, defaultValue) => {
  const initialValue = window.localStorage.getItem(key)
    ? JSON.parse(window.localStorage.getItem(key))
    : defaultValue;

  const [value, setValue] = createSignal(initialValue);

  const setValueAndStore = ((newValue) => {
    try {
      const strignifiedValue = JSON.stringify(newValue);
      setValue(JSON.parse(strignifiedValue));
      window.localStorage.setItem(key, strignifiedValue);
    } catch (error) {
      console.log(error);
    }
  });

  return [value, setValueAndStore];
};

export default useLocalStorage;
