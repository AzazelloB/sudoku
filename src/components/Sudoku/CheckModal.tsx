import { Component, Accessor, Setter } from 'solid-js';

import { formatTime } from '~/utils/datetime';

import Modal from '~/ui/Modal';
import Control from '~/ui/Control';
import Button from '~/ui/Button';

interface CheckModalProps {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
  onCheck: () => void;
  onNewGame: () => void;
  solved: Accessor<boolean>;
  time: Accessor<number>;
}

const CheckModal: Component<CheckModalProps> = (props) => {
  const handleModalNewGame = (closeModal: () => void) => {
    closeModal();
    props.onNewGame();
  };

  return (
    <Modal
      open={props.open}
      setOpen={props.setOpen}
    >
      <Control
        as={Modal.Button}
        key="Enter"
        onClick={props.onCheck}
      >
        Check
      </Control>

      <Modal.Content>
        {({ closeModal }) => (
          <div class="flex w-60 flex-col">
            <Modal.Title>
              {props.solved() ? 'Congratulations!' : 'Sorry!'}
            </Modal.Title>

            <p class="text-black opacity-60 dark:text-white">
              {props.solved() ? (
                <>
                  Your time: {formatTime(props.time())}
                  <br />
                  You solved the puzzle!
                </>
              ) : (
                <>
                  You have not solved the puzzle yet.
                </>
              )}
            </p>

            <div class="ml-auto mt-6">
              {props.solved() && (
                <Button
                  class="mr-4"
                  onClick={[handleModalNewGame, closeModal]}
                >
                  New Game
                </Button>
              )}

              <Button
                onClick={closeModal}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
};

export default CheckModal;
