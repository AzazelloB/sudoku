import { createSignal } from 'solid-js';

import Button from '~/ui/Button';
import ButtonGroup from '~/ui/ButtonGroup';

import Board from '~/components/Sudoku/Board';
import { checkIfSolved, generateGrid, revealCells } from '~/components/Sudoku/board';

const HomePage = () => {
  const [mode] = createSignal('normal');
  const [difficulty, setDifficulty] = createSignal('normal');

  const handleDifficultyClick = (difficulty) => () => {
    setDifficulty(difficulty);
  };

  const handleNewGameClick = () => {
    generateGrid();
    revealCells(difficulty());
  };

  const handleCheckClick = () => {
    console.log(checkIfSolved());
  };

  return (
    <div class="flex">
      <div>
        <div class="flex justify-between items-end mb-6">
          <div>
            <h4 class="text-lg mb-1 font-bold">Difficulty</h4>
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

        <Board
          difficulty={difficulty}
          mode={mode}
        />
      </div>
    </div>
  );
};

export default HomePage;
