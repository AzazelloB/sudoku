import { ModalProvider } from '~/context/ModalContext';

import Button from '~/ui/Modal/Button';
import Content from '~/ui/Modal/Content';
import Title from '~/ui/Modal/Title';

const Modal = (props) => {
  return (
    <ModalProvider>
      {props.children}
    </ModalProvider>
  );
};

Modal.Button = Button;
Modal.Title = Title;
Modal.Content = Content;

export default Modal;
