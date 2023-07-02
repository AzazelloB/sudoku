import {
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import classNames from 'classnames';
import { Transition, TransitionChild } from 'solid-headless';

import { DifficultyLevel } from '~/constants/difficulty';
import useLocalStorage from '~/hooks/useLocalStorage';
import { canRedefineControls } from '~/utils/controls';

import Button from '~/ui/Button';
import ButtonGroup from '~/ui/ButtonGroup';
import Control from '~/ui/Control';

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

const HomePage = () => {
  const [cells, setCells] = useLocalStorage<Cell[]>('cells', []);

  const [panelRef, setPanelRef] = createSignal<HTMLElement | null>(null);

  const [mode, setMode] = createSignal<InsertionMode>('middle');
  const [tool, setTool] = createSignal<Tool>('digits');

  const [difficulty, setDifficulty] = useLocalStorage<DifficultyLevel>('difficulty', 'normal');
  const [paused, setPause] = createSignal(false);
  const [time, setTime] = useLocalStorage('time', 0);
  const [solved, setSolved] = createSignal(false);
  const [generatingNewBoard, setGeneratingNewBoard] = createSignal(false);

  const handleKeyboardDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'Space':
        if (canRedefineControls()) {
          handlePausePlay();
        }
        break;

      case 'KeyR':
        restartGame();
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
    setSolved(checkIfSolved());
  };

  return (
    <div class="flex justify-center lg:gap-12 gap-4 lg:flex-row flex-col">
      <div>
        <h4 class="text-lg mb-1 font-bold">Difficulty</h4>

        <div class="flex justify-between lg:items-center mb-6 lg:flex-row flex-col">
          <div>
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
          </div>

          <Timer
            time={time}
            paused={paused}
            onPausePlay={handlePausePlay}
            class="hidden lg:flex mx-4"
          />

          <div class="flex mt-4 lg:mt-0 justify-between">
            <Control
              as={Button}
              key="R"
              class="mr-4"
              loading={generatingNewBoard()}
              onClick={handleNewGame}
            >
              Restart
            </Control>

            <Timer
              time={time}
              paused={paused}
              onPausePlay={handlePausePlay}
              class="flex lg:hidden mx-4"
            />

            <CheckModal
              solved={solved}
              time={time}
              onCheck={handleCheck}
              onNewGame={handleNewGame}
            />
          </div>
        </div>

        <div class="relative">
          <Transition
            show={paused()}
            class="absolute z-10 inset-0 overflow-hidden"
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
              <div class="h-full flex items-center justify-center">
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
              panel={panelRef}
              mode={mode}
              tool={tool}
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
