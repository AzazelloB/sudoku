import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';

import { useGlobalContext } from '~/context/GlobalContext';

import { Renderer } from '~/components/Board/renderer';
import { cellsInRow, scale } from '~/components/Board/settings';

interface HighlightSequence {
  name: 'highlightedCell';
  steps: CellPosition[];
}

interface SelectSequence {
  name: 'selectedCells';
  steps: CellPosition[];
  atOnce?: boolean;
}

interface InsertSequence {
  name: 'cells';
  steps: (CellPosition & { value: number })[];
}

type Sequence = (HighlightSequence | SelectSequence | InsertSequence)[];

export interface Animation {
  state: State;
  sequence: Sequence;
  crop?: {
    startCol: number;
    startRow: number;
    endCol: number;
    endRow: number;
  }
}

interface SequencedBoardProps {
  animation: Animation;
  width: number;
  height: number;
  class?: string;
}

const SequencedBoard: Component<SequencedBoardProps> = (props) => {
  // eslint-disable-next-line solid/reactivity
  const initialState = props.animation.state;
  // eslint-disable-next-line solid/reactivity
  const { sequence } = props.animation;
  let state: State = JSON.parse(JSON.stringify(initialState));

  const { theme } = useGlobalContext();

  // eslint-disable-next-line solid/reactivity
  const [canvasWidth, setCanvasWidth] = createSignal(props.width);
  // eslint-disable-next-line solid/reactivity
  const [canvasHeight, setCanvasHeight] = createSignal(props.height);

  let canvas: HTMLCanvasElement;

  const renderer = new Renderer();

  onMount(() => {
    const ctx = canvas.getContext('2d')!;

    const onResize = () => {
      const padding = 48;

      const width = window.outerWidth - padding < props.width
        ? window.outerWidth - (padding * 2)
        : props.width;
      const height = window.innerHeight - padding < props.height
        ? window.innerHeight - (padding * 2)
        : props.height;

      const size = Math.min(
        width,
        height,
      );

      setCanvasWidth(size);
      setCanvasHeight(size);

      renderer.resize(size * scale, size * scale);

      if (props.animation.crop) {
        const cellSize = (size * scale) / cellsInRow;

        const x = props.animation.crop.startCol * cellSize;
        const y = props.animation.crop.startRow * cellSize;
        const width = (props.animation.crop.endCol - props.animation.crop.startCol + 1) * cellSize;
        const height = (props.animation.crop.endRow - props.animation.crop.startRow + 1) * cellSize;

        renderer.setCrop(
          ctx,
          x,
          y,
          width,
          height,
        );
      }
    };

    onResize();
    document.addEventListener('resize', onResize);

    onCleanup(() => {
      document.removeEventListener('resize', onResize);
    });
  });

  createEffect(() => {
    renderer.setTheme(theme());
  });

  createEffect(() => {
    const ctx = canvas.getContext('2d')!;

    let prevTimeStamp = 0;

    let frame: number;

    const gameLoop = (timeStamp: number) => {
      const dt = (timeStamp - prevTimeStamp) / 1000;
      prevTimeStamp = timeStamp;

      advance(timeStamp);

      renderer.drawBackground(ctx);

      renderer.drawCellColors(ctx, state.cells);
      renderer.drawGrid(ctx);

      renderer.drawHighlightedCell(ctx, dt, state.highlightedCell);

      renderer.drawSelection(ctx, state.selectedCells);

      renderer.drawValues(ctx, state.cells);

      frame = window.requestAnimationFrame(gameLoop);
    };

    frame = window.requestAnimationFrame(gameLoop);

    onCleanup(() => {
      cancelAnimationFrame(frame);
    });
  });

  const delay = 500;
  const loopDelay = 2000;

  let step = 0;
  let actionIndex = 0;
  let prevTimeStamp = 0;

  const advance = (ts: number) => {
    if (sequence.length === actionIndex) {
      if (ts - prevTimeStamp < loopDelay) {
        return;
      }

      actionIndex = 0;
      state = JSON.parse(JSON.stringify(initialState));
    }

    if (ts - prevTimeStamp < delay) {
      return;
    }

    prevTimeStamp = ts;

    const action = sequence[actionIndex];

    switch (action.name) {
      case 'highlightedCell': {
        const currentCellPosition = renderer.getAnimatedHighlightedCellPosition();
        const targetCellPosition = action.steps[step];
        state.highlightedCell = targetCellPosition;

        if (
          currentCellPosition?.col === targetCellPosition.col
          && currentCellPosition?.row === targetCellPosition.row
        ) {
          step++;
        }

        if (action.steps.length <= step) {
          step = 0;
          actionIndex++;
        }

        break;
      }

      case 'selectedCells': {
        if (action.atOnce) {
          state.selectedCells = action.steps.slice();
          step = action.steps.length;
        } else {
          state.selectedCells = action.steps.slice(0, step + 1);
          step++;
        }

        if (action.steps.length <= step) {
          step = 0;
          actionIndex++;
        }

        break;
      }

      case 'cells': {
        const index = state.cells.findIndex(
          (cell) => cell.col === action.steps[step].col
                 && cell.row === action.steps[step].row,
        );

        state.cells[index].value = action.steps[step].value;
        step++;

        if (action.steps.length <= step) {
          step = 0;
          actionIndex++;
        }

        break;
      }

      default:
        throw new Error(`Unknown action: ${(action as any).name}`);
    }
  };

  return (
    <canvas
      ref={canvas!}
      width={canvasWidth() * scale}
      height={canvasHeight() * scale}
      class={props.class}
      style={{
        width: `${canvasWidth()}px`,
        height: `${canvasHeight()}px`,
      }}
    />
  );
};

export default SequencedBoard;
