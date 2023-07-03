import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { useGlobalContext } from '~/context/GlobalContext';
import { subscribe, unsubscribe } from '~/utils/pubSub';

import { initControls } from '~/components/Sudoku/controls';
import { Renderer } from '~/components/Sudoku/renderer';
import { initialHeight, initialWidth, scale } from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

interface BoardProps {
  paused: () => boolean;
  panel: Accessor<HTMLElement | null>;
  mode: Accessor<InsertionMode>;
  tool: Accessor<Tool>;
}

const Board: Component<BoardProps> = (props) => {
  const { theme } = useGlobalContext();

  let boardCanvas: HTMLCanvasElement;
  let continuousCanvas: HTMLCanvasElement;
  let valuesCanvas: HTMLCanvasElement;
  let overlayCanvas: HTMLCanvasElement;
  
  const renderer = new Renderer();

  onCleanup(() => {
    renderer.destroy();
  });

  const [canvasWidth, setCanvasWidth] = createSignal(initialWidth);
  const [canvasHeight, setCanvasHeight] = createSignal(initialHeight);

  const drawBoardAndValues = (
    boardCtx: CanvasRenderingContext2D,
    valuesCtx: CanvasRenderingContext2D
  ) => {
    renderer.drawBackground(boardCtx);
    renderer.drawBackground(valuesCtx);

    renderer.drawCellColors(boardCtx);
    renderer.drawGrid(boardCtx);

    renderer.drawValues(valuesCtx);
  }

  onMount(() => {
    const boardCtx = boardCanvas.getContext('2d')!;
    const valuesCtx = valuesCanvas.getContext('2d')!;

    const onResize = () => {
      const { top, left } = continuousCanvas.getBoundingClientRect();
      const padding = 24;

      const size = Math.min(
        window.innerWidth > 1024 ? window.innerWidth / 2 : window.innerWidth - (left * 2),
        window.innerHeight - top - padding,
      );

      setCanvasWidth(size);
      setCanvasHeight(size);

      renderer.resize(size * scale, size * scale);

      window.requestAnimationFrame(() => drawBoardAndValues(boardCtx, valuesCtx));
    };

    onResize();
    window.addEventListener('resize', onResize);

    onCleanup(() => {
      window.removeEventListener('resize', onResize);
    });
  });

  createEffect(() => {
    if (props.paused()) {
      return;
    }

    const boardCtx = boardCanvas.getContext('2d')!;
    const valuesCtx = valuesCanvas.getContext('2d')!;

    const renderBoardAndValues = () => {
      renderer.pushToRenderQueue(() => {
        drawBoardAndValues(boardCtx, valuesCtx);
      });
    };

    drawBoardAndValues(boardCtx, valuesCtx);
    subscribe('cells:changed', renderBoardAndValues);

    onCleanup(() => {
      unsubscribe('cells:changed', renderBoardAndValues);
    });
  });

  createEffect(() => {
    if (props.paused()) {
      return;
    }

    const continuousCtx = continuousCanvas.getContext('2d')!;
    const overlayCtx = overlayCanvas.getContext('2d')!;

    let prevTimeStamp = 0;

    let frame: number;

    const gameLoop = (timeStamp: number) => {
      const dt = (timeStamp - prevTimeStamp) / 1000;
      prevTimeStamp = timeStamp;

      renderer.drawBackground(continuousCtx);

      renderer.drawHighlightedCell(continuousCtx, dt);
  
      renderer.drawHighlightedRowColArea(continuousCtx, dt);
  
      renderer.drawSelection(continuousCtx);

      renderer.drawBackground(overlayCtx);

      if (state.debug) {
        renderer.drawFPS(overlayCtx, dt);
      }

      if (state.showControls) {
        renderer.drawControlSchema(overlayCtx);
      }

      frame = window.requestAnimationFrame(gameLoop);
    };

    frame = window.requestAnimationFrame(gameLoop);

    onCleanup(() => {
      cancelAnimationFrame(frame);
    });
  });

  createEffect(() => {
    if (props.paused()) {
      return;
    }

    const cleanup = initControls({
      canvas: continuousCanvas,
      panel: props.panel()!,
      mode: props.mode(),
      tool: props.tool(),
    });

    onCleanup(cleanup);
  });

  createEffect(() => {
    renderer.setTheme(theme());

    const boardCtx = boardCanvas.getContext('2d')!;
    const valuesCtx = valuesCanvas.getContext('2d')!;

    drawBoardAndValues(boardCtx, valuesCtx);
  });

  return (
    <div class="relative">
      <canvas
        ref={boardCanvas!}
        class="absolute inset-0 pointer-events-none z-10"
        width={canvasWidth() * scale}
        height={canvasHeight() * scale}
        style={{
          width: `${canvasWidth()}px`,
          height: `${canvasHeight()}px`,
        }}
      />
      <canvas
        ref={continuousCanvas!}
        tabIndex={0}
        class={twMerge(
          'relative z-20',
          // TODO figure out how to show focus ring only when using tab
          'focus-visible:outline-none'
          // 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-4',
          // 'focus-visible:ring-white dark:focus-visible:ring-offset-background-dark',
        )}
        width={canvasWidth() * scale}
        height={canvasHeight() * scale}
        style={{
          width: `${canvasWidth()}px`,
          height: `${canvasHeight()}px`,
        }}
      />
      <canvas
        ref={valuesCanvas!}
        class="absolute inset-0 pointer-events-none z-30"
        width={canvasWidth() * scale}
        height={canvasHeight() * scale}
        style={{
          width: `${canvasWidth()}px`,
          height: `${canvasHeight()}px`,
        }}
      />
      <canvas
        ref={overlayCanvas!}
        class="absolute inset-0 pointer-events-none z-40"
        width={canvasWidth() * scale}
        height={canvasHeight() * scale}
        style={{
          width: `${canvasWidth()}px`,
          height: `${canvasHeight()}px`,
        }}
      />
    </div>
  );
};

export default Board;
