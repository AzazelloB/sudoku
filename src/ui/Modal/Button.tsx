import { Component, ComponentProps } from 'solid-js';
import { useModalContext } from '~/context/ModalContext';

import ButtonUI from '~/ui/Button';

const Button: Component<ComponentProps<typeof ButtonUI>> = (props) => {
  const { setOpen } = useModalContext();

  const openModal = (e: any) => {
    setOpen(true);

    if (typeof props.onClick === 'function') {
      props.onClick(e);
    }
  };

  return (
    <ButtonUI
      {...props}
      onClick={openModal}
    >
      {props.children}
    </ButtonUI>
  );
};

export default Button;
