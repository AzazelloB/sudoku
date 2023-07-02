import { Accessor, Component, onCleanup, onMount } from 'solid-js';

import { useModalContext } from '~/context/ModalContext';
import { formatTime } from '~/utils/datetime';
import { canRedefineControls } from '~/utils/controls';

import Control from '~/ui/Control';
import Modal from '~/ui/Modal';
import Button from '~/ui/Button';

interface CheckModalInContextProps {
  onCheck: () => void;
  onNewGame: () => void;
  solved: Accessor<boolean>;
  time: Accessor<number>;
}

const CheckModalInContext: Component<CheckModalInContextProps> = (props) => {
  const { setIsOpen } = useModalContext();

  const handleKeyboardDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'Enter':
        if (canRedefineControls()) {
          e.preventDefault();
          setIsOpen(true);
          props.onCheck();
        }
        break;

      default:
        break;
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyboardDown);

    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyboardDown);
    });
  });

  const handleModalNewGame = () => {
    setIsOpen(false);
    props.onNewGame();
  };

  return (
    <>
      <Control
        as={Modal.Button}
        key="Enter"
        onClick={props.onCheck}
      >
        Check
      </Control>

      <Modal.Content>
        {({ closeModal }) => (
          <div class="flex flex-col w-60">
            <Modal.Title>
              {props.solved() ? 'Congratulations!' : 'Sorry!'}
            </Modal.Title>

            <p class="text-black dark:text-white opacity-60">
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
                  onClick={handleModalNewGame}
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
    </>
  );
};

export default CheckModalInContext;
