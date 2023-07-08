import {
  Accessor,
  Component,
  Ref,
  Setter,
  Show, onCleanup, onMount,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { colors } from '~/constants/theme';

import Button from '~/ui/Button';
import Control from '~/ui/Control';

import {
  clearSelectedCells,
  insertCorner,
  insertMiddle,
  insertValue,
  insertColor,
} from '~/components/Board/board';
import {
  handleRedo,
  handleUndo,
  saveSnapshot,
} from '~/components/Board/history';
import Bakcspace from '~/ui/icons/Backspace';
import Undo from '~/ui/icons/Undo';
import Redo from '~/ui/icons/Redo';
import { onShortcut } from '~/utils/controls';

const tools: Tool[] = ['digits', 'colors'];

const getNextTool = (currentTool: Tool): Tool => {
  const index = tools.indexOf(currentTool);
  const nextIndex = (index + 1) % tools.length;

  return tools[nextIndex];
};

interface PanelProps {
  ref: Ref<HTMLDivElement>;
  class: string;
  mode: Accessor<InsertionMode>;
  setMode: Setter<InsertionMode>;
  tool: Accessor<Tool>;
  setTool: Setter<Tool>;
}

const Panel: Component<PanelProps> = (props) => {
  const handleKeyboardDown = (e: KeyboardEvent) => {
    // eslint-disable-next-line solid/reactivity
    onShortcut(e, () => {
      props.setMode('normal');
    }, {
      code: 'KeyZ',
    });

    // eslint-disable-next-line solid/reactivity
    onShortcut(e, () => {
      props.setMode('middle');
    }, {
      code: 'KeyX',
    });

    // eslint-disable-next-line solid/reactivity
    onShortcut(e, () => {
      props.setMode('corner');
    }, {
      code: 'KeyC',
    });

    // eslint-disable-next-line solid/reactivity
    onShortcut(e, () => {
      props.setTool(getNextTool(props.tool()));
    }, {
      code: 'KeyM',
    });
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

  const className = 'font-light text-lg flex items-center justify-center';

  return (
    <div
      ref={props.ref}
      class={twMerge(
        'grid grid-cols-4 gap-4 text-3xl lg:text-6xl aspect-square select-none',
        props.class,
      )}
    >
      <Control
        as={Button}
        key="Z"
        class={twMerge(className, 'row-start-auto px-2 py-2 lg:px-4 lg:py-2')}
        active={props.mode() === 'normal'}
        onClick={[props.setMode, 'normal']}
      >
        <span class="hidden lg:block">Normal</span>
        <div
          class="flex aspect-square w-full items-center justify-center rounded-md border-2 text-2xl lg:hidden"
        >
          1
        </div>
      </Control>
      <Control
        as={Button}
        key="X"
        class={twMerge(className, 'row-start-2 col-start-auto px-2 py-2 lg:px-4 lg:py-2')}
        active={props.mode() === 'middle'}
        onClick={[props.setMode, 'middle']}
      >
        <span class="hidden lg:block">Middle</span>
        <div
          class="flex aspect-square w-full items-center justify-center rounded-md border-2 text-xs lg:hidden"
        >
          12
      </div>
      </Control>
      <Control
        as={Button}
        key="C"
        class={twMerge(className, 'row-start-3 col-start-auto px-2 py-2 lg:px-4 lg:py-2')}
        active={props.mode() === 'corner'}
        onClick={[props.setMode, 'corner']}
      >
        <span class="hidden lg:block">Corner</span>
        <div class="grid aspect-square w-full grid-cols-2 items-center rounded-md border-2 text-xs lg:hidden">
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </div>
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
          <div class="aspect-square w-full bg-cell-seven" />
        </Control>
        <Control
          as={Button}
          key="8"
          corenr={3}
          onClick={[handleColor, colors.cell.eight]}
        >
          <div class="aspect-square w-full bg-cell-eight" />
        </Control>
        <Control
          as={Button}
          key="9"
          corenr={3}
          onClick={[handleColor, colors.cell.nine]}
        >
          <div class="aspect-square w-full bg-cell-nine" />
        </Control>

        <Control
          as={Button}
          key="4"
          corenr={3}
          onClick={[handleColor, colors.cell.four]}
        >
          <div class="aspect-square w-full bg-cell-four" />
        </Control>
        <Control
          as={Button}
          key="5"
          corenr={3}
          onClick={[handleColor, colors.cell.five]}
        >
          <div class="aspect-square w-full bg-cell-five" />
        </Control>
        <Control
          as={Button}
          key="6"
          corenr={3}
          onClick={[handleColor, colors.cell.six]}
        >
          <div class="aspect-square w-full bg-cell-six" />
        </Control>

        <Control
          as={Button}
          key="1"
          corenr={3}
          onClick={[handleColor, colors.cell.one]}
        >
          <div class="aspect-square w-full bg-background-light dark:bg-background-dark" />
        </Control>
        <Control
          as={Button}
          key="2"
          corenr={3}
          onClick={[handleColor, colors.cell.two]}
        >
          <div class="aspect-square w-full bg-cell-two" />
        </Control>
        <Control
          as={Button}
          key="3"
          corenr={3}
          onClick={[handleColor, colors.cell.tree]}
        >
          <div class="aspect-square w-full bg-cell-tree" />
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
        <span class="hidden lg:block">Clear</span>
        <Bakcspace class="block h-6 w-6 lg:hidden" />
      </Control>
      <Control
        as={Button}
        key="Z"
        ctrl
        corenr={3}
        class={className}
        onClick={handleUndo}
      >
        <span class="hidden lg:block">Undo</span>
        <Undo class="block h-6 w-6 lg:hidden" />
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
        <span class="hidden lg:block">Redo</span>
        <Redo class="block h-6 w-6 lg:hidden" />
      </Control>

      <Control
        as={Button}
        key="M"
        corenr={3}
        class={`${className} capitalize`}
        onClick={[props.setTool, getNextTool(props.tool())]}
      >
        {getNextTool(props.tool())}
      </Control>
    </div>
  );
};

export default Panel;
