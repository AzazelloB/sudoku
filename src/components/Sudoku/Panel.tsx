import {
  Accessor,
  Component,
  Ref,
  Setter,
  Show, onCleanup, onMount,
} from 'solid-js';
import classNames from 'classnames';

import { colors } from '~/constants/theme';

import Button from '~/ui/Button';
import Control from '~/ui/Control';

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

const tools: Tool[] = ['digits', 'colors'];

const getNextTool = (currentTool: Tool): Tool => {
  const index = tools.indexOf(currentTool);
  const nextIndex = (index + 1) % tools.length;

  return tools[nextIndex];
};

interface PanelProps {
  ref: Ref<HTMLDivElement>;
  mode: Accessor<InsertionMode>;
  setMode: Setter<InsertionMode>;
  tool: Accessor<Tool>;
  setTool: Setter<Tool>;
}

const Panel: Component<PanelProps> = (props) => {
  const handleKeyboardDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyZ':
        props.setMode('normal');
        break;

      case 'KeyX':
        props.setMode('middle');
        break;

      case 'KeyC':
        props.setMode('corner');
        break;

      case 'KeyM':
        props.setTool(getNextTool(props.tool()));
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

  const handleNumber = (number: number) => {
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

  const handleColor = (color: string) => {
    insertColor(color);

    saveSnapshot();
  };

  const handleClear = () => {
    clearSelectedCells();
    saveSnapshot();
  };

  const className = 'text-lg';

  return (
    <div
      ref={props.ref}
      class="grid grid-cols-3 lg:grid-cols-4 gap-4 text-6xl aspect-square mt-8 select-none"
    >
      <Control
        as={Button}
        key="Z"
        class={classNames(className, 'row-start-4 lg:row-start-auto')}
        active={props.mode() === 'normal'}
        onClick={[props.setMode, 'normal']}
      >
        Normal
      </Control>
      <Control
        as={Button}
        key="X"
        class={classNames(className, 'row-start-4 col-start-2 lg:row-start-2 lg:col-start-auto')}
        active={props.mode() === 'middle'}
        onClick={[props.setMode, 'middle']}
      >
        Middle
      </Control>
      <Control
        as={Button}
        key="C"
        class={classNames(className, 'row-start-4 col-start-3 lg:row-start-3 lg:col-start-auto')}
        active={props.mode() === 'corner'}
        onClick={[props.setMode, 'corner']}
      >
        Corner
      </Control>

      <Show
        when={props.tool() === 'digits'}
      >
        <Control
          as={Button}
          key="7"
          corenr={3}
          onClick={[handleNumber, 7]}
        >
          7
        </Control>
        <Control
          as={Button}
          key="8"
          corenr={3}
          onClick={[handleNumber, 8]}
        >
          8
        </Control>
        <Control
          as={Button}
          key="9"
          corenr={3}
          onClick={[handleNumber, 9]}
        >
          9
        </Control>

        <Control
          as={Button}
          key="4"
          corenr={3}
          onClick={[handleNumber, 4]}
        >
          4
        </Control>
        <Control
          as={Button}
          key="5"
          corenr={3}
          onClick={[handleNumber, 5]}
        >
          5
        </Control>
        <Control
          as={Button}
          key="6"
          corenr={3}
          onClick={[handleNumber, 6]}
        >
          6
        </Control>

        <Control
          as={Button}
          key="1"
          corenr={3}
          onClick={[handleNumber, 1]}
        >
          1
        </Control>
        <Control
          as={Button}
          key="2"
          corenr={3}
          onClick={[handleNumber, 2]}
        >
          2
        </Control>
        <Control
          as={Button}
          key="3"
          corenr={3}
          onClick={[handleNumber, 3]}
        >
          3
        </Control>
      </Show>

      <Show
        when={props.tool() === 'colors'}
      >
        <Control
          as={Button}
          key="7"
          corenr={3}
          onClick={[handleColor, colors.cell.seven]}
        >
          <div class="bg-cell-seven w-full aspect-square" />
        </Control>
        <Control
          as={Button}
          key="8"
          corenr={3}
          onClick={[handleColor, colors.cell.eight]}
        >
          <div class="bg-cell-eight w-full aspect-square" />
        </Control>
        <Control
          as={Button}
          key="9"
          corenr={3}
          onClick={[handleColor, colors.cell.nine]}
        >
          <div class="bg-cell-nine w-full aspect-square" />
        </Control>

        <Control
          as={Button}
          key="4"
          corenr={3}
          onClick={[handleColor, colors.cell.four]}
        >
          <div class="bg-cell-four w-full aspect-square" />
        </Control>
        <Control
          as={Button}
          key="5"
          corenr={3}
          onClick={[handleColor, colors.cell.five]}
        >
          <div class="bg-cell-five w-full aspect-square" />
        </Control>
        <Control
          as={Button}
          key="6"
          corenr={3}
          onClick={[handleColor, colors.cell.six]}
        >
          <div class="bg-cell-six w-full aspect-square" />
        </Control>

        <Control
          as={Button}
          key="1"
          corenr={3}
          onClick={[handleColor, colors.cell.one]}
        >
          <div class="bg-background-light dark:bg-background-dark w-full aspect-square" />
        </Control>
        <Control
          as={Button}
          key="2"
          corenr={3}
          onClick={[handleColor, colors.cell.two]}
        >
          <div class="bg-cell-two w-full aspect-square" />
        </Control>
        <Control
          as={Button}
          key="3"
          corenr={3}
          onClick={[handleColor, colors.cell.tree]}
        >
          <div class="bg-cell-tree w-full aspect-square" />
        </Control>
      </Show>

      <Control
        as={Button}
        alternatives={[
          {
            key: 'Backspace',
          },
          {
            key: 'Delete',
          },
        ]}
        class={className}
        onClick={handleClear}
      >
        Clear
      </Control>
      <Control
        as={Button}
        key="Z"
        ctrl
        corenr={3}
        class={className}
        onClick={handleUndo}
      >
        Undo
      </Control>
      <Control
        as={Button}
        key="Z"
        ctrl
        shift
        corenr={3}
        class={className}
        onClick={handleRedo}
      >
        Redo
      </Control>

      <Control
        as={Button}
        key="M"
        corenr={3}
        class="text-lg capitalize"
        onClick={[props.setTool, getNextTool(props.tool())]}
      >
        {getNextTool(props.tool())}
      </Control>
    </div>
  );
};

export default Panel;
