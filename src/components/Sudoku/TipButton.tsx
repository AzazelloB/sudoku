import {
  Accessor, Component, createSignal,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { publish } from '~/utils/pubSub';

import Button from '~/ui/Button';
import Bulb from '~/ui/icons/Bulb';
import Popover from '~/ui/Popover';

import { state } from '~/components/Sudoku/state';

import Tipper from '~/workers/tipper?worker';

import { TipType } from '~/workers/tipper';

const messages = {
  [TipType.NOTHING]: {
    message: 'Even I don\'t know what to do',
  },
  [TipType.EASY_NAKED_SINGLE]: {
    message: 'Naked single',
  },
  [TipType.NAKED_SINGLE]: {
    message: 'Look closer, it\'s a naked single',
  },
  [TipType.BOARD_FINISHED]: {
    message: 'You\'ve solved the puzzle, Genius!',
  },
};

interface TipButtonProps {
  paused: Accessor<boolean>;
}

const TipButton: Component<TipButtonProps> = (props) => {
  let worker: Worker;

  const [tipType, setTipType] = createSignal<TipType>(0);

  const getMessage = () => {
    return messages[tipType()].message;
  };

  const handleTip = () => {
    return new Promise((resolve, reject) => {
      if (window.Worker) {
        worker = worker instanceof Worker ? worker : new Tipper();

        const maskedCells = [];

        for (let i = 0; i < state.cells.length; i++) {
          const cell = state.cells[i];

          if (cell.revealed) {
            maskedCells.push(cell.answer);
          } else if (cell.value) {
            maskedCells.push(cell.value);
          } else {
            maskedCells.push(null);
          }
        }

        worker.postMessage({
          cells: maskedCells,
        });

        const callback = (message: MessageEvent) => {
          const response = JSON.parse(message.data);

          setTipType(response.type);
          publish('tip:added', response.cells);
          resolve(response);

          worker.removeEventListener('message', callback);
        };

        worker.addEventListener('message', callback);
      } else {
        reject(new Error('No worker object'));
      }
    });
  };

  return (
    <Popover>
      <Popover.Button
        as={Button}
        title="Get a tip"
        class={twMerge(
          'p-3',
          'transition-all ease-in-out duration-200',
          props.paused() && 'opacity-0 pointer-events-none',
        )}
        variant="secondary"
        shape="circle"
        onClick={handleTip}
      >
        <Bulb class="w-4 h-4" />
      </Popover.Button>

      <Popover.Content
        class="left-0"
      >
        <p class="text-sm">
          <strong>{getMessage()}</strong>
        </p>
      </Popover.Content>
    </Popover>
  );
};

export default TipButton;
