import classNames from 'classnames';

import DarkModeToggle from '~/ui/DarkModeToggle';

const Header = () => {
  return (
    <header class={classNames(
      'bg-primary text-white px-8 py-4 drop-shadow-lg',
      'flex justify-between items-center',
    )}>
      <div>left</div>

      <div>
        <DarkModeToggle />
      </div>
    </header>
  );
};

export default Header;
