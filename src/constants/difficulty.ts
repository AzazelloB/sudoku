import { RuleType } from '~/constants/rules';

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'expert';

export const difficultyLevels: Record<DifficultyLevel, number> = {
  easy: 38,
  normal: 30,
  hard: 23,
  expert: 17, // 17 is the minimum number of revealed cells for a sudoku to have a unique solution
};

// references for refactoring: https://arxiv.org/pdf/1201.0749.pdf
export const ruleWeights: Record<RuleType, number> = {
  [RuleType.NORMAL_SUDOKU]: 0,
  [RuleType.KINGS_MOVE]: 4,
  [RuleType.KNIGHTS_MOVE]: 7,
  [RuleType.KILLER_SUDOKU]: 0,
  [RuleType.THERMO]: 4,
};
