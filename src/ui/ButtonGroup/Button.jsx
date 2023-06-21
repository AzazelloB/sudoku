import classNames from 'classnames';

import ButtonUI from '~/ui/Button';

const Button = (props) => {
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
