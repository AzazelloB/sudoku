import { useModalContext } from '~/context/ModalContext';

import ButtonUI from '~/ui/Button';

const Button = (props) => {
  const { setIsOpen } = useModalContext();

  const openModal = () => {
    setIsOpen(true);

    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <ButtonUI
      onClick={openModal}
    >
      {props.children}
    </ButtonUI>
  );
};

export default Button;
