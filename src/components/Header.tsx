import classNames from 'classnames';

import logo from '~/assets/logo.svg';

import Button from '~/ui/Button';
import DarkModeToggle from '~/ui/DarkModeToggle';
import Popover from '~/ui/Popover';
import Question from '~/ui/icons/Question';

const Header = () => {
  return (
    <header class={classNames(
      'bg-primary text-white px-8 py-4 drop-shadow-lg',
      'flex justify-between items-center',
    )}>
      <img src={logo} alt="logo" width={50} height={50} />

      <div class="flex">
        <Popover>
          <Popover.Button
            as={Button}
            class="p-2 mr-4"
          >
            <Question class="w-5 h-5" />
          </Popover.Button>

          <Popover.Content>
            <div>
              <p class="text-sm">
                <strong>Shift + /</strong> or "?" to show controls
              </p>
            </div>
          </Popover.Content>
        </Popover>

        <DarkModeToggle />
      </div>
    </header>
  );
};

export default Header;
