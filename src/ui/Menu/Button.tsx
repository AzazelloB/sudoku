import { ComponentProps, ParentComponent } from 'solid-js';
import {
  MenuTrigger,
} from '@ark-ui/solid/menu';

import ButtonUI from '~/ui/Button';

type ButtonProps = ComponentProps<typeof ButtonUI>;

const Button: ParentComponent<ButtonProps> = (props) => {
  return (
    <MenuTrigger asChild>
      <ButtonUI {...props} />
    </MenuTrigger>
  );
};

export default Button;
