import { state } from '~/components/Board/state';

interface Shortcut {
  code: KeyboardEvent['code'];
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export const onShortcut = (e: KeyboardEvent, callback: CallableFunction, shortcut: Shortcut) => {
  if (state.castSpell) {
    return;
  }

  if (shortcut.code !== e.code) {
    return;
  }

  const ctrl = e.ctrlKey || e.metaKey;
  if ((!!shortcut.ctrl) !== ctrl) {
    return;
  }

  if ((!!shortcut.alt) !== e.altKey) {
    return;
  }

  const shift = e.shiftKey && !(e.code === 'ShiftLeft' || e.code === 'ShiftRight');

  if ((!!shortcut.shift) !== shift) {
    return;
  }

  if (canRedefineControls()) {
    e.preventDefault();

    callback();
  }
};

export const canRedefineControls = () => {
  return document.activeElement?.tagName !== 'BUTTON';
};
