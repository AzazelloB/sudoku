import { Component, ComponentProps } from 'solid-js';
import {
  PopoverTrigger,
} from '@ark-ui/solid/popover';

const Button: Component<ComponentProps<typeof PopoverTrigger>> = (props) => {
  return (
    <PopoverTrigger {...props} />
  );
};

export default Button;
