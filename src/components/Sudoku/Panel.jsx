import {
  Show,
} from 'solid-js';

import Button from '~/ui/Button';

import {
  clearSelectedCells,
  insertCorner,
  insertMiddle,
  insertValue,
  insertColor,
} from '~/components/Sudoku/board';
import {
  handleRedo,
  handleUndo,
  saveSnapshot,
} from '~/components/Sudoku/history';
import { colors } from '~/constants/theme';

const tools = ['digits', 'colors'];

const Panel = (props) => {
  const getNextTool = () => {
    const index = tools.indexOf(props.tool());
    const nextIndex = (index + 1) % tools.length;

    return tools[nextIndex];
  };

  const handleNumber = (number) => {
    switch (props.mode()) {
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

  return (
    <div
      ref={props.ref}
      class="grid grid-cols-4 gap-4 text-6xl aspect-square mt-8 select-none"
    >
      <Button
        class="text-lg"
        active={props.mode() === 'normal'}
        onClick={[props.setMode, 'normal']}
      >
        Normal
      </Button>
      <Button
        class="text-lg row-start-2"
        active={props.mode() === 'middle'}
        onClick={[props.setMode, 'middle']}
      >
        Middle
      </Button>
      <Button
        class="text-lg row-start-3"
        active={props.mode() === 'corner'}
        onClick={[props.setMode, 'corner']}
      >
        Corner
      </Button>

      <Show
        when={props.tool() === 'digits'}
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
        when={props.tool() === 'colors'}
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

      <Button class="text-lg capitalize" onClick={[props.setTool, getNextTool()]}>
        {getNextTool()}
      </Button>
    </div>
  );
};

export default Panel;