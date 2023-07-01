import Modal from '~/ui/Modal';

import CheckModalInContext from '~/components/Sudoku/CheckModalInContext';

const CheckModal = (props) => {
  return (
    <Modal>
      <CheckModalInContext {...props} />
    </Modal>
  );
};

export default CheckModal;
