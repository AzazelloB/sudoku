import { Component, ComponentProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { useModalContext } from '~/context/ModalContext';
import { AsProp } from '~/utils/asPropType';

import ButtonUI from '~/ui/Button';

const Button = <T extends Component>(props: AsProp<T, ComponentProps<typeof ButtonUI>>) => {
  const { setOpen } = useModalContext();

  const openModal = (e: any) => {
    setOpen(true);

    if (typeof props.onClick === 'function') {
      props.onClick(e);
    }
  };

  return (
    <Dynamic
      component={props.as || ButtonUI}
      {...props}
      onClick={openModal}
    >
      {props.children}
    </Dynamic>
  );
};

export default Button;
