import { historyLimit } from '~/components/Board/settings';
import { state } from '~/components/Board/state';

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

  const snapshot = JSON.stringify(state.cells);

  state.history.push(snapshot);
  state.historyCursor = state.history.length;
};

export const handleUndo = () => {
  if (state.historyCursor <= 1) {
    return;
  }

  const snapshot = state.history[--state.historyCursor - 1];

  state.cells = JSON.parse(snapshot);
};

export const handleRedo = () => {
  if (state.historyCursor >= state.history.length) {
    return;
  }

  const snapshot = state.history[state.historyCursor++];

  state.cells = JSON.parse(snapshot);
};
