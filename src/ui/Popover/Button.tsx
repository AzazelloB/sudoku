import { Component, ComponentProps } from 'solid-js';
import {
  PopoverTrigger,
} from '@ark-ui/solid/popover';
import { Dynamic } from 'solid-js/web';

import { AsProp } from '~/utils/asPropType';

import ButtonUI from '~/ui/Button';

const Button = <T extends Component>(props: AsProp<T, ComponentProps<typeof ButtonUI>>) => {
  return (
    <PopoverTrigger asChild>
      <Dynamic
        component={props.as || ButtonUI}
        {...props}
      >
        {props.children}
      </Dynamic>
    </PopoverTrigger>
  );
};

export default Button;
