import classNames from 'classnames';

import logo from '~/assets/logo.svg';

import Button from '~/ui/Button';
import DarkModeToggle from '~/ui/DarkModeToggle';
import Popover from '~/ui/Popover';
import Question from '~/ui/icons/Question';

const Header = () => {
  return (
    <header class={classNames(
      'bg-primary text-white px-8 py-4 shadow-lg',
      'flex justify-between items-center',
    )}>
      <img src={logo} alt="logo" class="h-12 w-12" />

      <div class="flex">
        <Popover>
          <Popover.Button
            as={Button}
            class="mr-4 p-2"
          >
            <Question class="h-5 w-5" />
          </Popover.Button>

          <Popover.Content>
            <div>
              <p class="text-sm">
                <strong class="font-semibold">Shift + /</strong> or "?" to show controls
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
