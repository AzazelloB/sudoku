import { historyLimit } from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

export const clearHistory = () => {
  state.history.length = 0;
  state.historyCursor = 0;
};

export const saveSnapshot = () => {
  if (state.historyCursor < state.history.length) {
    state.history.splice(state.historyCursor);
  }

  if (state.history.length >= historyLimit) {
    state.history.shift();
  }

  const snapshot = JSON.parse(JSON.stringify(state.cells));

  state.history.push(snapshot);
  state.historyCursor = state.history.length;
};

export const handleUndo = () => {
  if (state.historyCursor <= 1) {
    return;
  }

  const snapshot = state.history[--state.historyCursor - 1];

  state.cells = JSON.parse(JSON.stringify(snapshot));
};

export const handleRedo = () => {
  if (state.historyCursor >= state.history.length) {
    return;
  }

  const snapshot = state.history[state.historyCursor++];

  state.cells = JSON.parse(JSON.stringify(snapshot));
};
