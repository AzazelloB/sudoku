import { Component, ComponentProps } from 'solid-js';

import Modal from '~/ui/Modal';

import CheckModalInContext from '~/components/Sudoku/CheckModalInContext';

const CheckModal: Component<ComponentProps<typeof CheckModalInContext>> = (props) => {
  return (
    <Modal>
      <CheckModalInContext {...props} />
    </Modal>
  );
};

export default CheckModal;
