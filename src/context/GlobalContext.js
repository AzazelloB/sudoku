import { createEffect } from 'solid-js';

import useLocalStorage from '~/hooks/useLocalStorage';
import { createContext } from '~/utils/createContext';

function useGlobalState() {
  const [theme, setTheme] = useLocalStorage(
    'theme',
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  const [cells, setCells] = useLocalStorage('cells', []);

  createEffect(() => {
    if (theme() === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });

  return {
    theme,
    setTheme,
    cells,
    setCells,
  };
}

const [GlobalProvider, useGlobalContext] = createContext(useGlobalState);

export { GlobalProvider, useGlobalContext };
