import { ParentComponent } from 'solid-js';
import { ModalProvider, Params } from '~/context/ModalContext';

import Button from '~/ui/Modal/Button';
import Content from '~/ui/Modal/Content';
import Title from '~/ui/Modal/Title';

interface ModalComponent {
  Button: typeof Button;
  Title: typeof Title;
  Content: typeof Content;
}

type ModalProps = Params;

const Modal: ParentComponent<ModalProps> & ModalComponent = (props) => {
  return (
    <ModalProvider {...props}>
      {props.children}
    </ModalProvider>
  );
};

Modal.Button = Button;
Modal.Title = Title;
Modal.Content = Content;

export default Modal;
