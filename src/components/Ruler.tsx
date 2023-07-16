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
      <div class="mb-3 flex items-center space-x-2">
        <Menu
          value={{ rules: props.rules() }}
          // onValueChange={({ value }) => props.setRules(value as RuleType[])}
          onValueChange={console.log}
          onSelect={console.log}
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
                  name="rules"
                  type="checkbox"
                  value={option.value}
                  disabled={option.disabled}
                >
                  {(state) => (
                    <div class="flex items-center">
                      <span class={twMerge(
                        'w-2 h-2 rounded-full mr-2',
                        state().isActive
                          ? 'bg-bgfg-900 dark:bg-bgfg-100'
                          : 'border border-bgfg-900 dark:border-bgfg-100',
                      )} />
                      <span class="whitespace-nowrap">
                        {option.label}
                      </span>
                    </div>
                  )}
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
