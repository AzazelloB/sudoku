import classNames from 'classnames';

import logo from '~/assets/logo.svg';

import DarkModeToggle from '~/ui/DarkModeToggle';

const Header = () => {
  return (
    <header class={classNames(
      'bg-primary text-white px-8 py-4 drop-shadow-lg',
      'flex justify-between items-center',
    )}>
      <img src={logo} alt="logo" width={50} height={50} />

      <div>
        <DarkModeToggle />
      </div>
    </header>
  );
};

export default Header;
