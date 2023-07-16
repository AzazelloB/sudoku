import { Component, ComponentProps } from 'solid-js';
import {
  Menu as HeadlessMenu,
} from '@ark-ui/solid/menu';

import Button from '~/ui/Menu/Button';
import Content from '~/ui/Menu/Content';
import OptionItem from '~/ui/Menu/OptionItem';

interface MenuComponent {
  Button: typeof Button;
  Content: typeof Content;
  OptionItem: typeof OptionItem;
}

type MenuProps = ComponentProps<typeof HeadlessMenu>;

const Menu: Component<MenuProps> & MenuComponent = (props) => {
  return (
    <HeadlessMenu {...props} />
  );
};

Menu.Button = Button;
Menu.Content = Content;
Menu.OptionItem = OptionItem;

export default Menu;
