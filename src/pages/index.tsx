import {
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import classNames from 'classnames';
import { Transition, TransitionChild } from 'solid-headless';

import { DifficultyLevel } from '~/constants/difficulty';
import useLocalStorage from '~/hooks/useLocalStorage';
import { onShortcut } from '~/utils/controls';
import { publish } from '~/utils/pubSub';

import Button from '~/ui/Button';
import ButtonGroup from '~/ui/ButtonGroup';
import Control from '~/ui/Control';
import FullScreen from '~/ui/icons/FullScreen';

import Board from '~/components/Sudoku/Board';
import {
  checkIfSolved,
  generateGrid,
} from '~/components/Sudoku/board';
import { state } from '~/components/Sudoku/state';
import {
  clearHistory,
  saveSnapshot,
} from '~/components/Sudoku/history';
import Panel from '~/components/Sudoku/Panel';
import CheckModal from '~/components/Sudoku/CheckModal';
import Timer from '~/components/Sudoku/Timer';
import TipButton from '~/components/Sudoku/TipButton';

const HomePage = () => {
  const [cells, setCells] = useLocalStorage<Cell[]>('cells', []);

  const [tipBtnRef, setTipBtnRef] = createSignal<HTMLElement | null>(null);
  const [modalRef, setModalRef] = createSignal<HTMLElement | null>(null);
  const [panelRef, setPanelRef] = createSignal<HTMLElement | null>(null);

  const [mode, setMode] = createSignal<InsertionMode>('middle');
  const [tool, setTool] = createSignal<Tool>('digits');

  const [difficulty, setDifficulty] = useLocalStorage<DifficultyLevel>('difficulty', 'normal');
  const [paused, setPause] = createSignal(false);
  const [time, setTime] = useLocalStorage('time', 0);
  const [solved, setSolved] = createSignal(false);
  const [generatingNewBoard, setGeneratingNewBoard] = createSignal(false);

  const [checkModalOpen, setCheckModalOpen] = createSignal(false);

  const handleKeyboardDown = (e: KeyboardEvent) => {
    onShortcut(e, () => {
      if (!state.showControls) {
        state.showControls = true;
        publish('showControls', state.showControls);
      }
    }, {
      code: 'Slash',
      shift: true,
    });

    onShortcut(e, restartGame, {
      code: 'KeyR',
    });

    onShortcut(e, handlePausePlay, {
      code: 'Space',
    });

    onShortcut(e, () => {
      setCheckModalOpen(true);
      handleCheck();
    }, {
      code: 'Enter',
    });
  };

  const handleKeyboardUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'Slash':
        if (state.showControls) {
          state.showControls = false;
          publish('showControls', state.showControls);
        }
        break;

      default:
        break;
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyboardDown);
    document.addEventListener('keyup', handleKeyboardUp);

    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyboardDown);
      document.removeEventListener('keyup', handleKeyboardUp);
    });
  });

  const timer = setInterval(() => {
    if (!solved() && !paused() && !generatingNewBoard()) {
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

  onMount(async () => {
    if (cells().length === 0) {
      restartGame();
    } else {
      state.cells = cells();
      handleCheck();

      clearHistory();
      saveSnapshot();
    }
  });

  const restartGame = async () => {
    setGeneratingNewBoard(true);

    await generateGrid(difficulty());
    setCells(state.cells);

    clearHistory();
    saveSnapshot();

    setTime(0);
    setSolved(false);
    setPause(false);
    setGeneratingNewBoard(false);
  };

  const handleDifficulty = (diff: DifficultyLevel) => {
    setDifficulty(diff);
    restartGame();
  };

  const handlePausePlay = () => {
    setPause(!paused());
  };

  const handleNewGame = () => {
    restartGame();
  };

  const handleCheck = () => {
    setSolved(checkIfSolved(state.cells));
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div class="flex flex-col justify-center gap-4 lg:flex-row lg:gap-12">
      <div>
        <h4 class="mb-1 text-lg tracking-widest">Difficulty</h4>

        <div class="mb-4 flex flex-col justify-between font-light lg:mb-6 lg:flex-row lg:items-center">
          <div class="flex justify-between">
            <ButtonGroup>
              <ButtonGroup.Button
                first
                loading={generatingNewBoard()}
                active={difficulty() === 'easy'}
                onClick={[handleDifficulty, 'easy']}
              >
                Easy
              </ButtonGroup.Button>
              <ButtonGroup.Button
                loading={generatingNewBoard()}
                active={difficulty() === 'normal'}
                onClick={[handleDifficulty, 'normal']}
              >
                Normal
              </ButtonGroup.Button>
              <ButtonGroup.Button
                last
                loading={generatingNewBoard()}
                active={difficulty() === 'hard'}
                onClick={[handleDifficulty, 'hard']}
              >
                Hard
              </ButtonGroup.Button>
            </ButtonGroup>

            <Button
              class="ml-4 block lg:hidden"
              variant="secondary"
              onClick={toggleFullScreen}
            >
              <FullScreen class="h-6 w-6" />
            </Button>
          </div>

          <Timer
            time={time}
            paused={paused}
            onPausePlay={handlePausePlay}
            class="mx-4 hidden lg:flex"
          />

          <div class="mt-4 flex justify-between lg:mt-0">
            <Control
              as={Button}
              key="R"
              class="lg:mr-4"
              loading={generatingNewBoard()}
              onClick={handleNewGame}
            >
              Restart
            </Control>

                  <Timer
                    time={time}
                    paused={paused}
                    onPausePlay={handlePausePlay}
                    class="mx-4 flex lg:hidden"
                  />

            <CheckModal
              open={checkModalOpen}
              setOpen={setCheckModalOpen}
              solved={solved}
              time={time}
              onCheck={handleCheck}
              onNewGame={handleNewGame}
            />
          </div>
        </div>

        <div class="relative">
          <div class="absolute left-0 top-0 z-40 -translate-x-1/2 -translate-y-1/2">
            <TipButton
              ref={setTipBtnRef}
              modalRef={setModalRef}
              paused={paused}
            />
          </div>

          <Transition
            show={paused()}
            class="absolute inset-0 z-10 overflow-hidden"
          >
            <TransitionChild
              class="h-full"
              enter="transition ease-in-out duration-200 transform"
              enterFrom="-translate-y-full"
              enterTo="translate-y-0"
              leave="transition ease-in-out duration-200 transform"
              leaveFrom="translate-y-0"
              leaveTo="-translate-y-full"
            >
              <div class="flex h-full items-center justify-center">
                <div class={classNames(
                  'bg-background dark:bg-background-dark-accent rounded-md shadow-lg px-12 py-5',
                  'text-4xl',
                )}>
                  Paused
                </div>
              </div>
            </TransitionChild>
          </Transition>

          <div class={classNames(
            'transition-all duration-200',
            {
              'blur-md': paused(),
            },
          )}>
            <Board
              mode={mode}
              tool={tool}
              paused={paused}
              clickOutsideExceptions={[panelRef, tipBtnRef, modalRef]}
            />
          </div>
        </div>
      </div>

      <div>
        <Panel
          ref={setPanelRef}
          class="mt-0 lg:mt-8"
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
