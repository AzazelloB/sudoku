import classNames from 'classnames';
import { Component, ComponentProps } from 'solid-js';

import ButtonUI from '~/ui/Button';

interface ButtonProps extends ComponentProps<typeof ButtonUI> {
  first?: boolean;
  last?: boolean;
}

const Button: Component<ButtonProps> = (props) => {
  return (
    <ButtonUI
      {...props}
      class={classNames(
        props.class,
        {
          'rounded-l-none': props.last,
          'rounded-r-none': props.first,
          'rounded-none': !props.first && !props.last,
        },
      )}
    />
  );
};

export default Button;
