import classNames from 'classnames';

import { useGlobalContext } from '~/context/GlobalContext';

import Dark from '~/ui/icons/Dark';
import Light from '~/ui/icons/Light';

const DarkModeToggle = () => {
  const { theme, setTheme } = useGlobalContext();

  const toggleTheme = () => {
    setTheme(theme() === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      class={classNames(
        'bg-primary-700 dark:bg-primary-300 hover:opacity-80 p-2 rounded-lg',
      )}
      onClick={toggleTheme}
    >
      {theme() === 'dark' ? (
        <Light class="h-5" />
      ) : (
        <Dark class="h-5" />
      )}
    </button>
  );
};

export default DarkModeToggle;
