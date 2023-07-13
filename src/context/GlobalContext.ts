import { createEffect, createSignal, onCleanup } from 'solid-js';

import useLocalStorage from '~/hooks/useLocalStorage';
import { createContext } from '~/utils/createContext';

function useGlobalState() {
  const [theme, setTheme] = useLocalStorage<Theme>(
    'theme',
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );

  createEffect(() => {
    if (theme() === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });

  const [isFS, setFS] = createSignal(!!document.fullscreenElement);

  const onFSChange = () => {
    setFS(!!document.fullscreenElement);
  };

  document.addEventListener('fullscreenchange', onFSChange);

  onCleanup(() => {
    document.removeEventListener('fullscreenchange', onFSChange);
  });

  return {
    theme,
    setTheme,
    isFS,
  };
}

const [GlobalProvider, useGlobalContext] = createContext(useGlobalState);

export { GlobalProvider, useGlobalContext };
