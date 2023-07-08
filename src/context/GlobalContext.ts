import { createEffect, onCleanup, onMount } from 'solid-js';
import { state } from '~/components/Board/state';

import useLocalStorage from '~/hooks/useLocalStorage';
import { createContext } from '~/utils/createContext';

let spell = '';

function useGlobalState() {
  const [theme, setTheme] = useLocalStorage<Theme>(
    'theme',
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey && !(e.code === 'ShiftLeft' || e.code === 'ShiftRight');
    const alt = e.altKey;

    if (e.code === 'Backquote') {
      if (!ctrl && !shift && !alt) {
        state.castSpell = !state.castSpell;
        spell = '';
        return;
      }
    }

    if (!state.castSpell) {
      return;
    }

    spell += e.code[3];

    // TODO add avada kedavra
    switch (e.code) {
      case 'KeyR':
      case 'KeyE':
      case 'KeyV':
      case 'KeyL':
      case 'KeyI':
      case 'KeyO':
      case 'KeyU':
      case 'KeyM':
      case 'KeyS':
      case 'KeyN':
      case 'KeyX':
        if (spell === 'REVELIO') {
          state.revealed = !state.revealed;
          spell = '';
          state.castSpell = false;
        }
        if (spell === 'LUMOS') {
          setTheme('light');
          spell = '';
          state.castSpell = false;
        }
        if (spell === 'NOX') {
          setTheme('dark');
          spell = '';
          state.castSpell = false;
        }
        break;

      default:
        spell = '';
        state.castSpell = false;
        break;
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);

    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });
  });

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
  };
}

const [GlobalProvider, useGlobalContext] = createContext(useGlobalState);

export { GlobalProvider, useGlobalContext };
