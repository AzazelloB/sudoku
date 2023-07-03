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
  
  let boardRenderer: Renderer | null = null;
  let continuousRenderer: Renderer | null = null;
  let valuesRenderer: Renderer | null = null;
  let overlayRenderer: Renderer | null = null;

  const renderQueue: CallableFunction[] = [];

  const [canvasWidth, setCanvasWidth] = createSignal(initialWidth);
  const [canvasHeight, setCanvasHeight] = createSignal(initialHeight);

  const drawBoardAndValues = () => {
    boardRenderer?.drawBackground();
    valuesRenderer?.drawBackground();

    boardRenderer?.drawCellColors();

    boardRenderer?.drawGrid();

    valuesRenderer?.drawValues();
  };

  const pushToRenderQueue = (fn: CallableFunction) => {
    renderQueue.push(fn);
  };

  let frame: number;

  const render = () => {
    if (renderQueue.length) {
      const fn = renderQueue.pop();
      fn?.();
      renderQueue.length = 0;
    }

    frame = window.requestAnimationFrame(render);
  };

  frame = window.requestAnimationFrame(render);

  onCleanup(() => {
    window.cancelAnimationFrame(frame);
  });

  onMount(() => {
    boardRenderer = new Renderer(boardCanvas, theme());
    continuousRenderer = new Renderer(continuousCanvas, theme());
    valuesRenderer = new Renderer(valuesCanvas, theme());
    overlayRenderer = new Renderer(overlayCanvas, theme());

    const renderBoardAndValues = () => {
      pushToRenderQueue(drawBoardAndValues);
    };

    subscribe('cells:changed', renderBoardAndValues);

    onCleanup(() => {
      unsubscribe('cells:changed', renderBoardAndValues);
    });

    const onResize = () => {
      const { top, left } = continuousCanvas.getBoundingClientRect();
      const padding = 24;

      const size = Math.min(
        window.innerWidth > 1024 ? window.innerWidth / 2 : window.innerWidth - (left * 2),
        window.innerHeight - top - padding,
      );

      setCanvasWidth(size);
      setCanvasHeight(size);

      boardRenderer!.resize(size * scale, size * scale);
      continuousRenderer!.resize(size * scale, size * scale);
      valuesRenderer!.resize(size * scale, size * scale);
      overlayRenderer!.resize(size * scale, size * scale);

      window.requestAnimationFrame(drawBoardAndValues);
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

    let prevTimeStamp = 0;

    let frame: number;

    const gameLoop = (timeStamp: number) => {
      const dt = (timeStamp - prevTimeStamp) / 1000;
      prevTimeStamp = timeStamp;

      continuousRenderer!.drawBackground();

      continuousRenderer!.drawHighlightedCell(dt);
  
      continuousRenderer!.drawHighlightedRowColArea(dt);
  
      continuousRenderer!.drawSelection();

      overlayRenderer!.drawBackground();

      if (state.debug) {
        overlayRenderer!.drawFPS(dt);
      }

      if (state.showControls) {
        overlayRenderer!.drawControlSchema();
      }

      frame = window.requestAnimationFrame(gameLoop);
    };

    frame = window.requestAnimationFrame(gameLoop);
    onCleanup(() => {
      cancelAnimationFrame(frame);
    });

    const cleanup = initControls({
      canvas: continuousCanvas,
      panel: props.panel()!,
      mode: props.mode(),
      tool: props.tool(),
    });

    onCleanup(cleanup);
  });

  createEffect(() => {
    boardRenderer?.setTheme(theme());
    continuousRenderer?.setTheme(theme());
    valuesRenderer?.setTheme(theme());
    overlayRenderer?.setTheme(theme());

    drawBoardAndValues();
  });

  return (
    <div class="relative">
      <canvas
        ref={boardCanvas!}
        onReset={drawBoardAndValues}
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
        onReset={drawBoardAndValues}
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
        onReset={drawBoardAndValues}
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
