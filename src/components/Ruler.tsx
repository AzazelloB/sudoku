import {
  Accessor, Component, Setter, For,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { RuleType } from '~/constants/rules';

const ruleMessages: Record<RuleType, string> = {
  [RuleType.NORMAL_SUDOKU]: 'Normal Sudoku',
  [RuleType.KINGS_MOVE]: 'King\'s Move',
  [RuleType.KNIGHTS_MOVE]: 'Knight\'s Move',
};

interface RulerProps {
  class?: string;
  rules: Accessor<RuleType[]>;
  setRules: Setter<RuleType[]>;
}

const Ruler: Component<RulerProps> = (props) => {
  return (
    <div class={twMerge(
      props.class,
    )}>
      <For each={props.rules()}>
        {(rule) => (
          <div class="flex items-center space-x-2">
            <div class="h-2 w-2 rounded-full bg-green-500" />
            <span>{ruleMessages[rule]}</span>
          </div>
        )}
      </For>
    </div>
  );
};

export default Ruler;
