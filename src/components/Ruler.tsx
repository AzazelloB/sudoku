import {
  Accessor, Component, Setter, For,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { RuleType } from '~/constants/rules';
import Menu from '~/ui/Menu';
import Cog from '~/ui/icons/Cog';

const ruleMessages: Record<RuleType, string> = {
  [RuleType.NORMAL_SUDOKU]: 'Normal Sudoku',
  [RuleType.KINGS_MOVE]: 'King\'s Move',
  [RuleType.KNIGHTS_MOVE]: 'Knight\'s Move',
  [RuleType.KILLER_SUDOKU]: 'Killer Sudoku',
  [RuleType.THERMO]: 'Thermo',
  [RuleType.SUM_ARROW]: 'Sum Arrow',
};

interface Option {
  label: string;
  value: RuleType;
  disabled: boolean;
}

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

  // eslint-disable-next-line solid/reactivity
  const handleCheckboxChange = (option: Option) => ({ checked }: any) => {
    if (checked) {
      props.setRules([...props.rules(), option.value]);
    } else {
      props.setRules(props.rules().filter((rule) => rule !== option.value));
    }
  };

  return (
    <div class={twMerge(
      props.class,
    )}>
      <div class="mb-3 flex items-center space-x-2">
        <Menu
          closeOnSelect={false}
        >
          <Menu.Button
            variant="tertiary"
            class="p-1.5"
          >
            <Cog class="h-5 w-5" />
          </Menu.Button>

          <Menu.Content>
            <For each={toOptions(Object.values(RuleType))}>
              {(option) => (
                <Menu.OptionItem
                  id={option.value}
                  checked={props.rules().includes(option.value)}
                  onChange={handleCheckboxChange(option)}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </Menu.OptionItem>
              )}
            </For>
          </Menu.Content>
        </Menu>

        <h4 class="text-lg tracking-widest">Rules</h4>
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
