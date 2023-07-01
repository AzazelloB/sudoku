import { twMerge } from 'tailwind-merge';

import { formatTime } from '~/utils/datetime';

import Control from '~/ui/Control';
import Play from '~/ui/icons/Play';
import Pause from '~/ui/icons/Pause';

const Timer = (props) => {
  return (
    <div class={twMerge(
      'flex items-center',
      props.class,
    )}>
      <span
        class="pt-1 font-mono font-bold"
      >
        {formatTime(props.time())}
      </span>

      <Control
        key="Space"
        class="ml-4"
        variant="tertiary"
        onClick={props.onPausePlay}
      >
        {props.paused() ? <Play class="h-4" /> : <Pause class="h-4" />}
      </Control>
    </div>
  );
};

export default Timer;
