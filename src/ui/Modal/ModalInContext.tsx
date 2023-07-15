import { ParentComponent } from 'solid-js';
import { Dialog } from '@ark-ui/solid/dialog';

import { useModalContext } from '~/context/ModalContext';

const ModalInContext: ParentComponent = (props) => {
  const { open, setOpen } = useModalContext();

  const closeModal = () => {
    setOpen(false);
  };

  return (
    <Dialog
      modal
      open={open()}
      onClose={closeModal}
    >
      {props.children}
    </Dialog>
  );
};

export default ModalInContext;
