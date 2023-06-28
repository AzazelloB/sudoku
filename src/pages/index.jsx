import {
  createEffect,
  createSignal,
  onCleanup,
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
  generateGrid,
  revealCells,
} from '~/components/Sudoku/board';
import { state } from '~/components/Sudoku/state';
import {
  clearHistory,
  saveSnapshot,
} from '~/components/Sudoku/history';
import Panel from '~/components/Sudoku/Panel';
import { doStuff } from '~/components/Sudoku/playground';

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

    doStuff();

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
              setMode={setMode}
              tool={tool}
              setTool={setTool}
              paused={paused}
            />
          </div>
        </div>
      </div>

      <div>
        <Panel
          ref={setPanelRef}
          mode={mode}
          setMode={setMode}
          tool={tool}
          setTool={setTool}
        />
      </div>
    </div>
  );
};

export default HomePage;
