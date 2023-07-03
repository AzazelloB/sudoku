import { Component, ComponentProps } from 'solid-js';
import {
  PopoverButton,
} from 'solid-headless';

const Button: Component<ComponentProps<typeof PopoverButton>> = (props) => {
  return (
    <PopoverButton {...props} />
  );
};

export default Button;
