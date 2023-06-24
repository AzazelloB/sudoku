import { createSignal, onCleanup } from 'solid-js';
import classNames from 'classnames';

import { useGlobalContext } from '~/context/GlobalContext';
import useLocalStorage from '~/hooks/useLocalStorage';
import { formatTime } from '~/utils/datetime';

import Button from '~/ui/Button';
import ButtonGroup from '~/ui/ButtonGroup';
import Pause from '~/ui/icons/Pause';
import Play from '~/ui/icons/Play';
import Modal from '~/ui/Modal';

import Board from '~/components/Sudoku/Board';
import {
  checkIfSolved,
  clearSelectedCells,
  generateGrid,
  insertCorner,
  insertMiddle,
  insertValue,
  revealCells,
} from '~/components/Sudoku/board';
import { state } from '~/components/Sudoku/state';
import {
  clearHistory,
  handleRedo,
  handleUndo,
  saveSnapshot,
} from '~/components/Sudoku/history';

const HomePage = () => {
  const { setCells } = useGlobalContext();

  const [mode, setMode] = createSignal('middle');

  const [difficulty, setDifficulty] = useLocalStorage('difficulty', 'normal');
  const [paused, setPause] = createSignal(false);
  const [time, setTime] = useLocalStorage('time', 0);
  const [timerStopped, setTimerStopped] = createSignal(false);
  const [solved, setSolved] = createSignal(false);

  const timer = setInterval(() => {
    if (!timerStopped()) {
      setTime(time() + 1);
    }
  }, 1000);

  const autosave = setInterval(() => {
    if (!paused()) {
      setCells(state.cells);
    }
  }, 5000);

  onCleanup(() => {
    clearInterval(timer);
    clearInterval(autosave);
  });

  const restartGame = () => {
    generateGrid();
    revealCells(difficulty());
    setCells(state.cells);

    clearHistory();
    saveSnapshot();

    // this is here because click outside has an exception of buttons
    // and it doesn't clear the selected cells on new game or difficulty change
    state.selectedCells.length = 0;

    setTime(0);
    setTimerStopped(false);
    setPause(false);
  };

  const handleDifficulty = (diff) => {
    setDifficulty(diff);
    restartGame();
  };

  const handlePausePlay = () => {
    setTimerStopped(!paused());
    setPause(!paused());
  };

  const handleNewGame = () => {
    restartGame();
  };

  const handleCheck = () => {
    if (checkIfSolved()) {
      setTimerStopped(true);
      setSolved(true);
    } else {
      setSolved(false);
    }
  };

  const handleModalNewGame = (closeModal) => {
    closeModal();
    handleNewGame();
  };

  const handleMode = (mode) => {
    setMode(mode);
  };

  const handleNumber = (number) => {
    switch (mode()) {
      case 'normal':
        insertValue(number);
        break;

      case 'middle':
        insertMiddle(number);
        break;

      case 'corner':
        insertCorner(number);
        break;

      default:
        insertMiddle(number);
        break;
    }

    saveSnapshot();
  };

  const handleClear = () => {
    clearSelectedCells();
    saveSnapshot();
  };

  return (
    <div class="flex justify-center gap-12">
      <div>
        <h4 class="text-lg mb-1 font-bold">Difficulty</h4>

        <div class="flex justify-between items-center mb-6">
          <div>
            <ButtonGroup>
              <ButtonGroup.Button
                first
                active={difficulty() === 'easy'}
                onClick={[handleDifficulty, 'easy']}
              >
                Easy
              </ButtonGroup.Button>
              <ButtonGroup.Button
                active={difficulty() === 'normal'}
                onClick={[handleDifficulty, 'normal']}
              >
                Normal
              </ButtonGroup.Button>
              <ButtonGroup.Button
                last
                active={difficulty() === 'hard'}
                onClick={[handleDifficulty, 'hard']}
              >
                Hard
              </ButtonGroup.Button>
            </ButtonGroup>
          </div>

          <div class="flex items-center">
            <span>{formatTime(time())}</span>

            <Button
              class="ml-4"
              variant="tertiary"
              onClick={handlePausePlay}
            >
              {paused() ? <Play class="h-4" /> : <Pause class="h-4" />}
            </Button>
          </div>

          <div>
            <Button
              class="mr-4"
              onClick={handleNewGame}
            >
              New Game
            </Button>

            <Modal>
              <Modal.Button
                onClick={handleCheck}
              >
                Check
              </Modal.Button>

              <Modal.Content>
                {({ closeModal }) => (
                  <div class="flex flex-col w-60">
                    <Modal.Title>
                      {solved() ? 'Congratulations!' : 'Sorry!'}
                    </Modal.Title>

                    <p class="text-black dark:text-white opacity-60">
                      {solved() ? (
                        <>
                          Your time: {formatTime(time())}
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
                      {solved() && (
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
          </div>
        </div>

        <div class={classNames(
          'relative overflow-hidden',
        )}>
          <div class={classNames(
            'absolute z-10 inset-0 flex items-center justify-center',
            'transition-all duration-200',
            {
              '-translate-y-full': !paused(),
            },
          )}>
            <div class={classNames(
              'bg-background dark:bg-background-dark-accent rounded-md shadow-lg px-12 py-5',
              'text-4xl',
            )}>
              Paused
            </div>
          </div>

          <div class={classNames(
            'transition-all duration-200',
            {
              'blur-md pointer-events-none': paused(),
            },
          )}>
            <Board
              difficulty={difficulty}
              mode={mode}
            />
          </div>
        </div>
      </div>

      <div>
        <div class="grid grid-cols-4 gap-4 text-6xl aspect-square mt-8 select-none">
          <Button
            class="text-lg"
            active={mode() === 'normal'}
            onClick={[handleMode, 'normal']}
          >
            Normal
          </Button>
          <Button
            class="text-lg row-start-2"
            active={mode() === 'middle'}
            onClick={[handleMode, 'middle']}
          >
            Middle
          </Button>
          <Button
            class="text-lg row-start-3"
            active={mode() === 'corner'}
            onClick={[handleMode, 'corner']}
          >
            Corner
          </Button>

          <Button onClick={[handleNumber, 7]}>7</Button>
          <Button onClick={[handleNumber, 8]}>8</Button>
          <Button onClick={[handleNumber, 9]}>9</Button>

          <Button onClick={[handleNumber, 4]}>4</Button>
          <Button onClick={[handleNumber, 5]}>5</Button>
          <Button onClick={[handleNumber, 6]}>6</Button>

          <Button onClick={[handleNumber, 1]}>1</Button>
          <Button onClick={[handleNumber, 2]}>2</Button>
          <Button onClick={[handleNumber, 3]}>3</Button>

          <Button class="text-lg" onClick={handleClear}>Clear</Button>
          <Button class="text-lg" onClick={handleUndo}>Undo</Button>
          <Button class="text-lg" onClick={handleRedo}>Redo</Button>

          <Button class="text-lg">Mode</Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
