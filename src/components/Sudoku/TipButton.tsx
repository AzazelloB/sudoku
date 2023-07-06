import {
  Accessor, Component, createSignal, Ref, Show,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { TipType } from '~/workers/tipper';
import { delegateTaskTo } from '~/utils/humanResources';
import { publish } from '~/utils/pubSub';

import Button from '~/ui/Button';
import Bulb from '~/ui/icons/Bulb';
import Popover from '~/ui/Popover';
import Modal from '~/ui/Modal';
import Link from '~/ui/Link';

import { state } from '~/components/Sudoku/state';
import SequencedBoard, { Animation } from '~/components/Sudoku/SequencedBoard';
import animation from '~/components/Sudoku/nakedSingleAnimation.json';

interface TipData {
  message: string;
  hasExplanation: boolean;
}

interface TipDataWithExplanation extends TipData {
  hasExplanation: true;
  name: string;
  description: string;
}

interface TipDataWithoutExplanation extends TipData {
  hasExplanation: false;
}

type Tips = Record<TipType, TipDataWithExplanation | TipDataWithoutExplanation>

const tips: Tips = {
  [TipType.NOTHING]: {
    message: 'Even I don\'t know what to do',
    hasExplanation: false,
  },
  [TipType.TRY_THINKING]: {
    message: 'Try thinking',
    hasExplanation: false,
  },
  [TipType.EASY_NAKED_SINGLE]: {
    message: 'Naked single',
    hasExplanation: true,
    name: 'Naked single',
    description: 'is a cell that has only one possible value.',
  },
  [TipType.NAKED_SINGLE]: {
    message: 'Look closer, it\'s a naked single',
    hasExplanation: false,
  },
  [TipType.BOARD_FINISHED]: {
    message: 'You\'ve solved the puzzle, Genius!',
    hasExplanation: false,
  },
};

interface TipButtonProps {
  ref: Ref<HTMLDivElement>;
  modalRef: Ref<HTMLDivElement>;
  paused: Accessor<boolean>;
}

const TipButton: Component<TipButtonProps> = (props) => {
  const [tipType, setTipType] = createSignal<TipType | null>(null);

  const handleTip = async () => {
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

    const response = await delegateTaskTo('tipper', {
      cells: maskedCells,
    });

    setTipType(response.type);
    publish('tip:added', response.cells);
  };

  const tip = () => tips[tipType()!];
  const tipExp = () => tips[tipType()!] as TipDataWithExplanation;

  return (
    <div
      ref={props.ref}
    >
      <Modal>
        <Popover>
          <Popover.Button
            as={Button}
            title="Get a tip"
            class={twMerge(
              'p-2 lg:p-3',
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
            class="left-0 flex flex-col"
          >
              <Show when={tipType()} fallback="Thinking...">
                <p class="text-sm">
                  <strong class="font-semibold">{tip().message}</strong>
                </p>

                <Show when={tipType() && tips[tipType()!].hasExplanation}>
                  <Modal.Button
                    as={Link}
                    class="ml-auto mt-1 text-xs text-gray-400"
                  >
                    What's that?
                  </Modal.Button>
                </Show>
              </Show>
          </Popover.Content>
        </Popover>

        <Show when={tipType() && tips[tipType()!].hasExplanation}>
          <Modal.Content
            ref={props.modalRef}
            class="max-w-sm lg:max-w-xl"
          >
            {({ closeModal }) => (
              <div class="flex flex-col items-center">
                <SequencedBoard
                  animation={animation as unknown as Animation}
                  width={400}
                  height={400}
                />

                <p class="mt-6 text-lg">
                  <strong class="font-semibold">{tipExp().name}</strong>
                  &nbsp;{tipExp().description}
                </p>

                <Button
                  class="ml-auto mt-4"
                  onClick={closeModal}
                >
                  Close
                </Button>
              </div>
            )}
          </Modal.Content>
        </Show>
      </Modal>
    </div>
  );
};

export default TipButton;
