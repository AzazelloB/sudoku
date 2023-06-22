import { createSignal, onCleanup } from 'solid-js';
import classNames from 'classnames';

import { formatTime } from '~/utils/datetime';

import Button from '~/ui/Button';
import ButtonGroup from '~/ui/ButtonGroup';
import Pause from '~/ui/icons/Pause';
import Play from '~/ui/icons/Play';

import Board from '~/components/Sudoku/Board';
import { checkIfSolved, generateGrid, revealCells } from '~/components/Sudoku/board';

const HomePage = () => {
  const [mode] = createSignal('normal');
  const [difficulty, setDifficulty] = createSignal('normal');
  const [paused, setPause] = createSignal(false);
  const [time, setTime] = createSignal(0);

  const timer = setInterval(() => {
    if (!paused()) {
      setTime(time() + 1);
    }
  }, 1000);

  onCleanup(() => {
    clearInterval(timer);
  });

  const handleDifficultyClick = (difficulty) => () => {
    setDifficulty(difficulty);
  };

  const handlePausePlayClick = () => {
    setPause(!paused());
  };

  const handleNewGameClick = () => {
    generateGrid();
    revealCells(difficulty());
    setTime(0);
    setPause(false);
  };

  const handleCheckClick = () => {
    console.log(checkIfSolved());
  };

  return (
    <div class="flex">
      <div>
        <h4 class="text-lg mb-1 font-bold">Difficulty</h4>

        <div class="flex justify-between items-center mb-6">
          <div>
            <ButtonGroup>
              <ButtonGroup.Button
                first
                active={difficulty() === 'easy'}
                onClick={handleDifficultyClick('easy')}
              >
                Easy
              </ButtonGroup.Button>
              <ButtonGroup.Button
                active={difficulty() === 'normal'}
                onClick={handleDifficultyClick('normal')}
              >
                Normal
              </ButtonGroup.Button>
              <ButtonGroup.Button
                last
                active={difficulty() === 'hard'}
                onClick={handleDifficultyClick('hard')}
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
              onClick={handlePausePlayClick}
            >
              {paused() ? <Play class="h-4" /> : <Pause class="h-4" />}
            </Button>
          </div>

          <div>
            <Button
              class="mr-4"
              onClick={handleNewGameClick}
            >
              New Game
            </Button>

            <Button
              onClick={handleCheckClick}
            >
              Check
            </Button>
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
              'bg-background dark:bg-background-dark rounded-md shadow-lg px-12 py-5',
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
    </div>
  );
};

export default HomePage;
