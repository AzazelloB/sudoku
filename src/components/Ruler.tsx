import {
  Accessor, Component, Setter, For,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { RuleType } from '~/constants/rules';

const ruleMessages: Record<RuleType, string> = {
  [RuleType.NORMAL_SUDOKU]: 'Normal Sudoku',
  [RuleType.KINGS_MOVE]: 'King\'s Move',
  [RuleType.KNIGHTS_MOVE]: 'Knight\'s Move',
  [RuleType.KILLER_SUDOKU]: 'Killer Sudoku',
};

interface RulerProps {
  class?: string;
  savedRules: Accessor<RuleType[]>;
  rules: Accessor<RuleType[]>;
  setRules: Setter<RuleType[]>;
}

const Ruler: Component<RulerProps> = (props) => {
  const toOptions = (rules: RuleType[]) => rules.map((rule) => ({
    label: ruleMessages[rule],
    value: rule,
    disabled: rule === RuleType.NORMAL_SUDOKU,
  }));

  return (
    <div class={twMerge(
      props.class,
    )}>
      <div class="mb-3 flex items-center space-x-4">
        <h4 class="text-lg tracking-widest">Rules</h4>

        {/* <Select
          label="Select rules"
          selected={props.rules}
          setSelected={props.setRules}
          options={toOptions(Object.values(RuleType))}
        /> */}
      </div>

      <For each={props.rules()}>
        {(rule) => (
          <div class="flex items-center space-x-2">
            <span class={twMerge(
              'h-2 w-2 rounded-full',
              props.savedRules().includes(rule) ? 'bg-secondary-700' : 'bg-bgfg-400',
            )} />
            <span>{ruleMessages[rule]}</span>
          </div>
        )}
      </For>
    </div>
  );
};

export default Ruler;
