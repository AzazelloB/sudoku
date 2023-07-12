import {
  Accessor, Component, Setter, For,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { RuleType } from '~/constants/rules';
import { enumKeys } from '~/utils/enumKeys';

import Select from '~/ui/Select';
import { Option } from '~/ui/Select/Select';

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
  }));

  const selected = () => toOptions(props.rules());

  const setSelected = (options: Option[]) => {
    const newSelected = options.map((option) => option.value as RuleType);
    console.log(options);
    props.setRules([...new Set(newSelected)]);
  };

  return (
    <div class={twMerge(
      props.class,
    )}>
      <Select
        selected={selected}
        setSelected={setSelected}
        options={toOptions(enumKeys(RuleType))}
      />

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
