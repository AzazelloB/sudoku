import {
  createEffect,
  createSignal,
  onCleanup,
  Show,
} from 'solid-js';
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
  insertColor,
} from '~/components/Sudoku/board';
import { state } from '~/components/Sudoku/state';
import {
  clearHistory,
  handleRedo,
  handleUndo,
  saveSnapshot,
} from '~/components/Sudoku/history';
import { colors } from '~/constants/theme';

const tools = ['digits', 'colors'];

const HomePage = () => {
  const { setCells } = useGlobalContext();

  const [panelRef, setPanelRef] = createSignal(null);

  const [mode, setMode] = createSignal('middle');
  const [tool, setTool] = createSignal('digits');

  const [difficulty, setDifficulty] = useLocalStorage('difficulty', 'normal');
  const [paused, setPause] = createSignal(false);
  const [time, setTime] = useLocalStorage('time', 0);
  const [timerStopped, setTimerStopped] = createSignal(false);
  const [solved, setSolved] = createSignal(false);

  const handleKeyboardDown = (e) => {
    switch (e.code) {
      case 'Space':
        handlePausePlay();
        break;

      default:
        break;
    }
  };

  createEffect(() => {
    document.addEventListener('keydown', handleKeyboardDown);

    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyboardDown);
    });
  });

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

  const handleColor = (color) => {
    insertColor(color);

    saveSnapshot();
  };

  const handleClear = () => {
    clearSelectedCells();
    saveSnapshot();
  };

  const getNextTool = () => {
    const index = tools.indexOf(tool());
    const nextIndex = (index + 1) % tools.length;

    return tools[nextIndex];
  };

  const handleTool = () => {
    setTool(getNextTool());
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
              'blur-md': paused(),
            },
          )}>
            <Board
              panel={panelRef}
              difficulty={difficulty}
              mode={mode}
              paused={paused}
            />
          </div>
        </div>
      </div>

      <div>
        <div
          ref={setPanelRef}
          class="grid grid-cols-4 gap-4 text-6xl aspect-square mt-8 select-none"
        >
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

          <Show
            when={tool() === 'digits'}
          >
            <Button onClick={[handleNumber, 7]}>7</Button>
            <Button onClick={[handleNumber, 8]}>8</Button>
            <Button onClick={[handleNumber, 9]}>9</Button>

            <Button onClick={[handleNumber, 4]}>4</Button>
            <Button onClick={[handleNumber, 5]}>5</Button>
            <Button onClick={[handleNumber, 6]}>6</Button>

            <Button onClick={[handleNumber, 1]}>1</Button>
            <Button onClick={[handleNumber, 2]}>2</Button>
            <Button onClick={[handleNumber, 3]}>3</Button>
          </Show>

          <Show
            when={tool() === 'colors'}
          >
            <Button onClick={[handleColor, colors.cell.seven]}>
              <div class="bg-cell-seven w-full aspect-square" />
            </Button>
            <Button onClick={[handleColor, colors.cell.eight]}>
              <div class="bg-cell-eight w-full aspect-square" />
            </Button>
            <Button onClick={[handleColor, colors.cell.nine]}>
              <div class="bg-cell-nine w-full aspect-square" />
            </Button>

            <Button onClick={[handleColor, colors.cell.four]}>
              <div class="bg-cell-four w-full aspect-square" />
            </Button>
            <Button onClick={[handleColor, colors.cell.five]}>
              <div class="bg-cell-five w-full aspect-square" />
            </Button>
            <Button onClick={[handleColor, colors.cell.six]}>
              <div class="bg-cell-six w-full aspect-square" />
            </Button>

            <Button onClick={[handleColor, colors.cell.one]}>
              <div class="bg-background-light dark:bg-background-dark w-full aspect-square" />
            </Button>
            <Button onClick={[handleColor, colors.cell.two]}>
              <div class="bg-cell-two w-full aspect-square" />
            </Button>
            <Button onClick={[handleColor, colors.cell.tree]}>
              <div class="bg-cell-tree w-full aspect-square" />
            </Button>
          </Show>

          <Button class="text-lg" onClick={handleClear}>Clear</Button>
          <Button class="text-lg" onClick={handleUndo}>Undo</Button>
          <Button class="text-lg" onClick={handleRedo}>Redo</Button>

          <Button class="text-lg capitalize" onClick={handleTool}>{getNextTool()}</Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
