import {
  Accessor, Component, Setter, For,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { RuleType } from '~/constants/rules';
import { enumKeys } from '~/utils/enumKeys';

import Select from '~/ui/Select';

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
  const toOptions = (rules: RuleType[]) => rules.map((rule) => ({
    label: ruleMessages[rule],
    value: rule,
    disabled: rule === RuleType.NORMAL_SUDOKU,
  }));

  return (
    <div class={twMerge(
      props.class,
    )}>
      <Select
        class="mb-3"
        label="Select rules"
        selected={props.rules}
        setSelected={props.setRules}
        options={toOptions(enumKeys(RuleType))}
      />

      <For each={props.rules()}>
        {(rule) => (
          <div class="flex items-center space-x-2">
            <span class="h-2 w-2 rounded-full bg-secondary-700" />
            <span>{ruleMessages[rule]}</span>
          </div>
        )}
      </For>
    </div>
  );
};

export default Ruler;
